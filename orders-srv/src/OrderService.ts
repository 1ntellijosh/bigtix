/**
 * Class for Orders Service business logic
 *
 * @since orders-srv-start--JP
 */
import { OrderRepository } from './repositories/OrderRepository';
import { TicketRepository } from './repositories/TicketRepository';
import { NotFoundError, ServerError, BadRequestError } from '@bigtix/common';
import { SavedOrderDoc } from './models/Order';
import { SavedTicketDoc } from './models/Ticket';
import { OrderStatusEnum, ORDER_EXPIRATION_SECONDS } from '@bigtix/common';
import { TicketCreatedData, TicketUpdatedData, OrderExpiredData } from '@bigtix/middleware';
import { EventPublisher } from '@bigtix/middleware';
import { OrderEventFactory } from './events/OrderEventFactory';
import { EventTypesEnum } from '@bigtix/middleware';

export class OrderService {
  private orderRepo: OrderRepository;
  private ticketRepo: TicketRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.ticketRepo = new TicketRepository();
  }

  /**
   * Creates a new order and tickets
   *
   * @param {string} userId
   * @param {array<Object>} requestedTickets
   *
   * @returns {Promise<SavedOrderDoc>}
   *
   * @throws {ServerError}  If order is not created successfully
   */
  async createOrderAndReserveTickets(userId: string, requestedTickets: Array<{ id: string, price: number }>): Promise<Record<string, SavedOrderDoc | SavedTicketDoc[] | { id: string, price: number }[]>> {
    // Before all things, check which of the requested tickets are still available, unavailable, or not found
    const {
      availableTickets,
      unavailableTickets,
      ticketsNotFound
    } = await this.createAvailableAndUnavailableTicketLists(requestedTickets);

    /**
     * After checking availability of requested tickets, we will reserve the tickets that are available. If all tickets
     * are unavailable, throw an error. The user will be asked if they want to cancel the order in the frontend client
     * not all requested tickets are available, or pay for what was reserved.
     */
    if ((unavailableTickets.length + ticketsNotFound.length) === requestedTickets.length) {
      throw new BadRequestError('All tickets are unavailable');
    }

    const order = await this.createOrder(userId, this.createExpirationDate());

    if (!order) throw new ServerError('Order not created successfully');

    const reservedTickets = await this.assignOrderToTickets(order.id, availableTickets);

    // Publish created order event to the event bus
    await this.publishOrderCreatedEvent(userId, order, reservedTickets);

    // Start the expiration timer for the order (broker will deliver at expiresAt)
    await this.publishOrderExpirationEvent(order.id, order.expiresAt!);

    return { order, tickets: reservedTickets, unavailableTickets, ticketsNotFound };
  }

  /**
   * Creates a new expiration date for an order
   *
   * @returns {Date}
   */
  createExpirationDate(): Date {
    const expiration = new Date();
    // expiration.setSeconds(expiration.getSeconds() + ORDER_EXPIRATION_SECONDS);
    // temporary expiration for testing
    expiration.setSeconds(expiration.getSeconds() + 30); // 30 seconds
    
    return expiration;
  }

  /**
   * Takes in a list of tickets, and creates lists of available, unavailable, and not found tickets
   *
   * @param {array<Object>} requestedTickets
   *
   * @returns {Promise<{ availableTickets, unavailableTickets, ticketsNotFound }>}
   */
  async createAvailableAndUnavailableTicketLists(requestedTickets: Array<{ id: string, price: number }>): Promise<{ availableTickets: SavedTicketDoc[], unavailableTickets: { id: string, price: number }[], ticketsNotFound: { id: string, price: number }[] }> {
    const availableTickets: SavedTicketDoc[] = [];
    const unavailableTickets: { id: string, price: number }[] = [];
    const ticketsNotFound: { id: string, price: number }[] = [];

    const requestedTicketsIdsMap = new Map<string, { id: string, price: number }>();
    for (const ticket of requestedTickets) {
      requestedTicketsIdsMap.set(ticket.id, ticket);
    }

    // Before all things, check if the tickets are still available
    const savedTicketsData: SavedTicketDoc[] = await this.ticketRepo
      .findAllByIds(requestedTickets.map(reqTicket => reqTicket.id));

    for (const ticket of savedTicketsData) {
      this.ticketAvailable(ticket.order as SavedOrderDoc | null)
        ? availableTickets.push(ticket)
        : unavailableTickets.push(requestedTicketsIdsMap.get(ticket.id) as { id: string, price: number });
      requestedTicketsIdsMap.delete(ticket.id);
    }

    /**
     * This should hopefully never happen, but just in case, we can log the tickets that were not found, and let the
     * user know that some tickets are not available.
     */
    if (requestedTicketsIdsMap.size > 0) ticketsNotFound.push(...requestedTicketsIdsMap.values());

    return { availableTickets, unavailableTickets, ticketsNotFound };
  }

  /**
   * Determines if a ticket is available for reservation. They are not available if:
   * 1. Ticket is not already paid for in another order
   * 2. Ticket is not already reserved for another order (awaiting payment)
   *
   * @param ticket 
   * @returns 
   */
  ticketAvailable(ticketOrder: SavedOrderDoc | null): boolean {
    if (!ticketOrder) return true;

    return ticketOrder.status !== OrderStatusEnum.CREATED &&
      ticketOrder.status !== OrderStatusEnum.AWAITING_PAYMENT &&
      ticketOrder.status !== OrderStatusEnum.PAID;
  }

  /**
   * Creates a new order
   *
   * @param {string} userId
   *
   * @returns {Promise<SavedOrderDoc>}
   * 
   * @throws {BadRequestError}  If email is already in use
   */
  async createOrder(userId: string, expiration: Date): Promise<SavedOrderDoc> {
    // TODO: Add Data Service for UTC and all that jazz
    const order = await this.orderRepo.create({ userId, expiresAt: expiration, status: OrderStatusEnum.CREATED });

    return order;
  }

  /**
   * Assigns an order to a list of tickets
   *
   * @param {string} orderId  The id of the order to create tickets for
   * @param {array<Object>} tickets  The tickets to create, each with:
   *   @prop {string} ticketId  The id of the ticket to create
   *   @prop {number} price  The price of the ticket
   *
   * @returns {Promise<SavedTicketDoc[]>}
   * 
   * @throws {BadRequestError}  If email is already in use
   */
  async assignOrderToTickets(orderId: string, tickets: SavedTicketDoc[]): Promise<SavedTicketDoc[]> {
    const updatedTickets: SavedTicketDoc[] = [];
    for (const ticket of tickets) {
      const updatedTicket = await this.ticketRepo.updateById(ticket.id, {
        order: orderId,
      });
      if (updatedTicket) updatedTickets.push(updatedTicket);
    }

    return updatedTickets || [];
  }

  /**
   * Retrieves an order by id
   *
   * @param {string} id  The id of the order to retrieve
   *
   * @returns {Promise<SavedOrderDoc>}
   */
  async getOrderById(id: string): Promise<{ id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[], version: number }> {
    const order = await this.orderRepo.findById(id);
    
    if (!order) throw new NotFoundError('Order not found');

    const tickets = await this.getTicketsByOrderId(order.id);

    if (!tickets || tickets.length === 0) throw new NotFoundError('Tickets for an order not found');

    return {
      id: order.id,
      status: order.status,
      expiresAt: order.expiresAt as Date,
      userId: order.userId,
      tickets,
      version: order.version,
    };
  }

  /**
   * Retrieves all orders for a given user
   *
   * @param {string} userId  The userId of the user to retrieve tickets for
   *
   * @returns {Promise<SavedOrderDoc[]>}
   */
  async getOrdersByUserId(userId: string): Promise<{ id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }[]> {
    const orders = await this.orderRepo.findByUserId(userId);

    if (!orders || orders.length === 0) throw new NotFoundError('Orders not found');

    const ordersWithTickets: { id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }[] = [];
    for (const ord of orders) {
      const tickets = await this.getTicketsByOrderId(ord.id);

      if (!tickets || tickets.length === 0) throw new NotFoundError('Tickets for an ord not found');
      
      ordersWithTickets.push({
        id: ord.id,
        status: ord.status,
        expiresAt: ord.expiresAt as Date,
        userId: ord.userId,
        tickets,
      });
    }

    return ordersWithTickets;
  }

  /**
   * Retrieves all orders
   *
   * @returns {Promise<SavedOrderDoc[]>}
   */
  async getAllOrders(): Promise<SavedOrderDoc[]> {
    const orders = await this.orderRepo.findAll();
    
    return orders || [];
  }

  /**
   * Updates an order status by id
   *
   * @param {string} id  The id of the order to update
   * @param {string} status  The status of the order
   *
   * @returns {Promise<SavedOrderDoc>}
   */
  async updateOrderStatusById(id: string, status: OrderStatusEnum): Promise<SavedOrderDoc> {
    let order = await this.orderRepo.findById(id);

    if (!order) throw new NotFoundError('Order not found');

    order = await this.orderRepo.updateById(id, { status, version: (order.version + 1) });
    
    if (!order) throw new NotFoundError('Order not found');
    
    return order;
  }

  /**
   * Cancels an order by id
   *
   * @param {string} userId  The userId of the user to cancel the order for
   * @param {string} id  The id of the order to delete
   *
   * @returns {Promise<boolean | { id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }>}
   */
  async cancelOrderById(userId: string, id: string): Promise<{ id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }> {
    const order = await this.getOrderById(id);

    if (order.userId.toString() !== userId) throw new BadRequestError('You are not authorized to cancel this order');

    const updatedOrder = await this.updateOrderStatusById(id, OrderStatusEnum.CANCELLED);

    order.status = updatedOrder.status;
    order.version = updatedOrder.version;

    // Notify the order cancelled event to the event bus
    await this.publishOrderStatusChangedEvent(OrderStatusEnum.CANCELLED, order);

    return order;
  }

  /**
   * Saves a new ticket from a ticket creation event sent from ticket-srv
   *
   * @param event 
   *s
   * @returns {void}
   *
   * @throws {ServerError}  If the ticket cannot be created (will cause the event to be retried again later by the event bus)
   */
  async onTicketCreatedEvent(event: TicketCreatedData): Promise<void> {
    try {
      await this.ticketRepo.create({
        id: event.ticketId,
        title: event.title,
        price: event.price,
        order: null,
      });
    } catch (error) {
      console.error('Error in OrderService onTicketCreatedEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process OrderService onTicketCreatedEvent event: ' + error.message
        : 'Unknown error executing onTicketCreatedEvent in OrderService';

      throw new ServerError(msg);
    }
  }

  /**
   * Updates a ticket from a ticket update event sent from ticket-srv
   *
   * @param event 
   *
   * @returns {void}
   *
   * @throws {ServerError}  If the ticket cannot be updated (will cause the event to be retried again later by the event bus)
   */
  async onTicketUpdatedEvent(event: TicketUpdatedData): Promise<void> {
    try {
      const ticket = await this.ticketRepo.findById(event.ticketId);

      // Ticket must exist
      if (!ticket) throw new NotFoundError('Ticket not found');

      // Ticket version must be the next version
      if (event.version !== (ticket.version + 1)) throw new BadRequestError('Ticket version mismatch');

      await this.ticketRepo.updateById(event.ticketId, {
        title: event.title,
        price: event.price,
        version: event.version,
      });
    } catch (error) {
      console.error('Error in OrderService onTicketUpdatedEvent event:', error);

      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process OrderService onTicketUpdatedEvent event: ' + error.message
        : 'Unknown error executing onTicketUpdatedEvent in OrderService';

      throw new ServerError(msg);
    }
  }

  /**
   * Handles an incoming order expiration event
   *
   * @param {OrderExpiredData} event  The order expired data
   *
   * @returns {Promise<void>}
   */
  async onOrderExpirationEvent(event: OrderExpiredData): Promise<void> {
    await this.updateOrderStatusById(event.orderId, OrderStatusEnum.EXPIRED);

    const order = await this.getOrderById(event.orderId);

    await this.publishOrderStatusChangedEvent(OrderStatusEnum.EXPIRED, order);
  }

  /**
   * Retrieves a ticket by id
   *
   * @param {string} id  The id of the ticket to retrieve
   *
   * @returns {Promise<SavedTicketDoc>}
   */
  async getTicketById(id: string): Promise<SavedTicketDoc> {
    const ticket = await this.ticketRepo.findById(id);
    
    if (!ticket) throw new NotFoundError('Ticket not found');
    
    return ticket;
  }

  /**
   * Retrieves all tickets for a given order id
   *
   * @param {string} orderId  The order id of the tickets to retrieve
   *
   * @returns {Promise<SavedTicketDoc[]>}
   */
  async getTicketsByOrderId(orderId: string): Promise<SavedTicketDoc[]> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) throw new NotFoundError('Order not found');

    const tickets = await this.ticketRepo.findAllByOrderId(orderId);
    
    return tickets || [];
  }

  /**
   * Updates a ticket by id
   *
   * @param {string} id  The id of the ticket to update
   * @param {string} title  The title of the ticket
   * @param {number} price  The price of the ticket
   * @param {number} version  The version of the ticket
   *
   * @returns {Promise<SavedTicketDoc>}
   */
  async updateTicketById(id: string, title: string, price: number, version: number): Promise<SavedTicketDoc> {
    const ticket = await this.ticketRepo.findById(id);
    
    if (!ticket) throw new NotFoundError('Ticket not found');

    const updatedTicket = await this.ticketRepo.updateById(id, { id: ticket.id, title, price, version });
    
    if (!updatedTicket) throw new NotFoundError('Ticket not found');
    
    return updatedTicket;
  }

  /**
   * Creates an event publisher for a given event type
   *
   * @param {EventTypesEnum} eventType  The event type to create an event publisher for
   *
   * @returns {EventPublisher}
   */
  createEventPublisher(eventType: EventTypesEnum): EventPublisher {
    return new EventPublisher(
      new OrderEventFactory(eventType)
    );
  }

  /**
   * Publishes order created event to the event bus
   *
   * @param {SavedOrderDoc} order  The order to notify
   *
   * @returns {Promise<void>}
   */
  async publishOrderCreatedEvent(userId: string, order: SavedOrderDoc, reservedTickets: SavedTicketDoc[]): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_CREATED);
    await publisher.publishEvent('orders-srv.order-events', EventTypesEnum.ORDER_CREATED, {
      orderId: order.id,
      userId,
      tickets: reservedTickets.map((ticket: SavedTicketDoc) => ({ ticketId: ticket.id, price: ticket.price })),
      expiresAt: order.expiresAt!.toISOString(),
      status: order.status,
      version: order.version, // 0 is the initial version
    });
  }

  /**
   * Publishes order status changed event to the event bus
   *
   * @param {string} userId  The userId of the user to cancel the order for
   * @param {SavedOrderDoc} order  The order to notify
   *
   * @returns {Promise<void>}
   */
  async publishOrderStatusChangedEvent(
    status: OrderStatusEnum,
    order: { id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[], version: number }
  ): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_STATUS_CHANGED);
    await publisher.publishEvent('orders-srv.order-events', EventTypesEnum.ORDER_STATUS_CHANGED, {
      orderId: order.id,
      status,
      tickets: order.tickets.map((ticket: SavedTicketDoc) => ({ ticketId: ticket.id, price: ticket.price })),
      version: order.version,
    });
  }

  /**
   * Publishes order expiration event to the event bus. This message will be delivered by RabbitMQ at the given
   * expiration time, and Orders service will receive it and expire the order
   *
   * @param {string} orderId  The id of the order to expire
   * @param {Date} expiresAt  The expiration date of the order
   *
   * @returns {Promise<void>}
   */
  async publishOrderExpirationEvent(orderId: string, expiresAt: Date): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_EXPIRED);
    const delayMs = Math.max(0, expiresAt.getTime() - Date.now());
    await publisher.publishEvent(
      'orders-srv.order-events',
      EventTypesEnum.ORDER_EXPIRED,
      { orderId },
      { delayMs }
    );
  }
}
