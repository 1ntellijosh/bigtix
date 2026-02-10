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

    // Calculate expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + ORDER_EXPIRATION_SECONDS);

    const order = await this.createOrder(userId, expiration);

    if (!order) throw new ServerError('Order not created successfully');

    const reservedTickets = await this.assignOrderToTickets(order.id, availableTickets);

    return { order, tickets: reservedTickets, unavailableTickets, ticketsNotFound };
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
  async getOrderById(id: string): Promise<{ id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }> {
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
    };
  }

  /**
   * Retrieves a single order for a given user
   *
   * @param {string} userId  The userId of the user to retrieve the order for
   * @param {string} id  The id of the order to retrieve
   *
   * @returns {Promise<SavedOrderDoc>}
   */
  async getSingleUserOrder(userId: string, id: string): Promise<{ id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] }> {
    const order = await this.getOrderById(id);
    
    if (!order) throw new NotFoundError('Order not found');
    
    if (order.userId.toString() !== userId) throw new BadRequestError('You are not authorized to view this order');
    
    return order;
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
   * Updates an order by id
   *
   * @param {string} id  The id of the order to update
   * @param {string} status  The status of the order
   *
   * @returns {Promise<SavedOrderDoc>}
   */
  async updateOrderById(id: string, status: OrderStatusEnum): Promise<SavedOrderDoc> {
    const order = await this.orderRepo.updateById(id, { status });
    
    if (!order) throw new NotFoundError('Order not found');
    
    return order;
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
   * Cancels an order by id
   *
   * @param {string} userId  The userId of the user to cancel the order for
   * @param {string} id  The id of the order to delete
   *
   * @returns {Promise<boolean>}
   */
  async cancelOrderById(userId: string, id: string): Promise<boolean> {
    let order = await this.orderRepo.findById(id);

    if (!order) return false;

    if (order.userId.toString() !== userId) throw new BadRequestError('You are not authorized to cancel this order');

    order = await this.orderRepo.updateById(id, { status: OrderStatusEnum.CANCELLED });

    if (!order) return false;

    // Remove cancelled order id from all associated tickets
    // await this.ticketRepo.updateAllByOrderId(id, { order: null });

    return true;
  }

}
