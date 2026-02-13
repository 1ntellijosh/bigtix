/**
 * Class for Orders Service business logic
 *
 * @since orders-srv-start--JP
 */
import { OrderRepository } from './repositories/OrderRepository';
import { TicketRepository } from './repositories/TicketRepository';
import { OrdersQueryService } from './services/OrdersQueryService';
import { NotFoundError, BadRequestError, ServerError } from '@bigtix/common';
import { SavedOrderDoc } from './models/Order';
import { SavedTicketDoc } from './models/Ticket';
import { OrderStatusEnum } from '@bigtix/common';
import { EventTypesEnum } from '@bigtix/middleware';
import { TicketCreatedData, TicketUpdatedData, OrderExpiredData, PaymentCreatedData } from '@bigtix/middleware';
import { OrdersPublisher } from './events/OrdersPublisher';
import type { OrderWithTicketsDto } from './services/OrderMapper';
import { CreateOrderUseCase } from './usecases/CreateOrderUseCase';

export class OrderService {
  private orderRepo: OrderRepository;
  private ticketRepo: TicketRepository;
  private ordersQueryService: OrdersQueryService;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.ticketRepo = new TicketRepository();
    this.ordersQueryService = new OrdersQueryService();
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
    const createOrderUseCase = new CreateOrderUseCase(userId, requestedTickets);
    const {
      order,
      reservedTickets,
      unavailableTickets,
      ticketsNotFound
    } = await createOrderUseCase.execute();

    // Publish created order event to the event bus
    await OrdersPublisher.publishOrderCreatedEvent(userId, order, reservedTickets);

    // Start the expiration timer for the order (broker will deliver at expiresAt)
    await OrdersPublisher.publishOrderExpirationEvent(order.id, order.expiresAt!);

    return { order, tickets: reservedTickets, unavailableTickets, ticketsNotFound };
  }
  

  /**
   * Retrieves an order by id with tickets
   *
   * @param {string} id  The id of the order to retrieve
   *
   * @returns {Promise<OrderWithTicketsDto>}
   */
  async getOrderById(id: string): Promise<OrderWithTicketsDto> {
    return this.ordersQueryService.getOrderById(id);
  }

  /**
   * Retrieves all orders for a user with tickets
   *
   * @param {string} userId  The id of the user to retrieve orders for
   *
   * @returns {Promise<OrderWithTicketsDto[]>}
   */
  async getOrdersByUserId(userId: string): Promise<OrderWithTicketsDto[]> {
    return this.ordersQueryService.getOrdersByUserId(userId);
  }

  /**
   * Retrieves all orders
   *
   * @returns {Promise<SavedOrderDoc[]>}
   */
  async getAllOrders(): Promise<SavedOrderDoc[]> {
    return this.ordersQueryService.getAllOrders();
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
  async cancelOrderById(userId: string, id: string): Promise<OrderWithTicketsDto> {
    const order = await this.getOrderById(id);

    if (order.userId !== userId) throw new BadRequestError('You are not authorized to cancel this order');

    // If the order is already cancelled, expired, failed, paid, or awaiting payment, we don't need to do anything
    if ([
      OrderStatusEnum.CANCELLED,
      OrderStatusEnum.EXPIRED,
      OrderStatusEnum.FAILED,
      OrderStatusEnum.PAID,
      OrderStatusEnum.AWAITING_PAYMENT,
    ].includes(order.status)) throw new BadRequestError('Order is already cancelled, expired, failed, paid, or awaiting payment');

    const updatedOrder = await this.updateOrderStatusById(id, OrderStatusEnum.CANCELLED);

    const result: OrderWithTicketsDto = { ...order, status: updatedOrder.status, version: updatedOrder.version };

    await OrdersPublisher.publishOrderStatusChangedEvent(OrderStatusEnum.CANCELLED, result);

    return result;
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
    try {
    const order = await this.getOrderById(event.orderId);

    if (!order) throw new NotFoundError('Order not found');

    /**
     * First we need to check if the order status to see if it has been cancelled, paid, awaiting payment, or refunded,
     * and if so, we don't need to do anything
     */
    if ([
      OrderStatusEnum.CANCELLED,
      OrderStatusEnum.FAILED,
      OrderStatusEnum.PAID,
      OrderStatusEnum.AWAITING_PAYMENT,
      OrderStatusEnum.REFUNDED
    ].includes(order.status)) return;

    const updatedOrder = await this.updateOrderStatusById(event.orderId, OrderStatusEnum.EXPIRED);

    order.status = OrderStatusEnum.EXPIRED;
    order.version = updatedOrder.version;

    await OrdersPublisher.publishOrderStatusChangedEvent(OrderStatusEnum.EXPIRED, order);
    } catch (error) {
      console.error('Error in OrderService onOrderExpirationEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process OrderService onOrderExpirationEvent event: ' + error.message
        : 'Unknown error executing onOrderExpirationEvent in OrderService';

      throw new ServerError(msg);
    }
  }

  /**
   * Handles an incoming payment status updated event from payments-srv
   * - If the incoming event is PAYMENT_CREATED, updates the order status to AWAITING_PAYMENT.
   * - If the incoming event is PAYMENT_SUCCEEDED, updates the order status to PAID.
   * - If the incoming event is PAYMENT_FAILED, updates the order status to FAILED.
   *
   * @param {EventTypesEnum} eventType  The type of the event
   * @param {PaymentCreatedData} event  The payment created data
   *
   * @returns {Promise<void>}
   */
  async onPaymentStatusUpdatedEvent(eventType: EventTypesEnum, event: PaymentCreatedData): Promise<void> {
    try {
      const order = await this.getOrderById(event.orderId);

      if (!order) throw new NotFoundError('Order not found');

      let updatedStatus: OrderStatusEnum | undefined;
      switch (eventType) {
        case EventTypesEnum.PAYMENT_CREATED:
          updatedStatus = OrderStatusEnum.AWAITING_PAYMENT;
          break;
        case EventTypesEnum.PAYMENT_SUCCEEDED:
          updatedStatus = OrderStatusEnum.PAID;
          break;
        case EventTypesEnum.PAYMENT_FAILED:
          updatedStatus = OrderStatusEnum.FAILED;
          break;
        default:
          break;
      }

      // Update the order status in the database
      const updatedOrder = await this.updateOrderStatusById(event.orderId, updatedStatus!);

      // Inform other services of the order status change
      order.status = updatedOrder.status;
      order.version = updatedOrder.version;
      await OrdersPublisher.publishOrderStatusChangedEvent(order.status, order);
    } catch (error) {
      console.error('Error in OrderService onPaymentCreatedEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process OrderService onPaymentCreatedEvent event: ' + error.message
        : 'Unknown error executing onPaymentCreatedEvent in OrderService';

      throw new ServerError(msg);
    }
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
}
