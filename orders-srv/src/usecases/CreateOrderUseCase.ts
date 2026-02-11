/**
 * Use case class for creating a new order in orders-srv
 *
 * @since orders-srv-start--JP
 */
import { OrderRepository } from '../repositories/OrderRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { SavedOrderDoc } from '../models/Order';
import { SavedTicketDoc } from '../models/Ticket';
import { OrderStatusEnum, ORDER_EXPIRATION_SECONDS } from '@bigtix/common';
import { BadRequestError } from '@bigtix/common';
import { ServerError } from '@bigtix/common';


export class CreateOrderUseCase {
  private orderRepo: OrderRepository;
  private ticketRepo: TicketRepository;
  private userId: string;
  private requestedTickets: Array<{ id: string, price: number }>;

  constructor(userId: string, requestedTickets: Array<{ id: string, price: number }>) {
    this.userId = userId;
    this.requestedTickets = requestedTickets;
    this.orderRepo = new OrderRepository();
    this.ticketRepo = new TicketRepository();
  }

  /**
   * Creates a new order
   *
   * @returns {Promise<{ order: SavedOrderDoc, reservedTickets: SavedTicketDoc[], unavailableTickets: { id: string, price: number }[], ticketsNotFound: { id: string, price: number }[] }>}  The order with tickets
   */
  async execute(): Promise<{ order: SavedOrderDoc, reservedTickets: SavedTicketDoc[], unavailableTickets: { id: string, price: number }[], ticketsNotFound: { id: string, price: number }[] }> {
    // Before all things, check which of the requested tickets are still available, unavailable, or not found
    const {
      availableTickets,
      unavailableTickets,
      ticketsNotFound
    } = await this.createAvailableAndUnavailableTicketLists();

    /**
     * After checking availability of requested tickets, we will reserve the tickets that are available. If all tickets
     * are unavailable, throw an error. The user will be asked if they want to cancel the order in the frontend client
     * not all requested tickets are available, or pay for what was reserved.
     */
    if ((unavailableTickets.length + ticketsNotFound.length) === this.requestedTickets.length) {
      throw new BadRequestError('All tickets are unavailable');
    }

    const order = await this.createOrder();

    if (!order) throw new ServerError('Order not created successfully');

    const reservedTickets = await this.assignOrderToTickets(order.id, availableTickets);

    return { order, reservedTickets, unavailableTickets, ticketsNotFound };
  }

  /**
   * Takes in a list of tickets, and creates lists of available, unavailable, and not found tickets
   *
   *
   * @returns {Promise<{ availableTickets, unavailableTickets, ticketsNotFound }>}
   */
  async createAvailableAndUnavailableTicketLists(): Promise<{ availableTickets: SavedTicketDoc[], unavailableTickets: { id: string, price: number }[], ticketsNotFound: { id: string, price: number }[] }> {
    const availableTickets: SavedTicketDoc[] = [];
    const unavailableTickets: { id: string, price: number }[] = [];
    const ticketsNotFound: { id: string, price: number }[] = [];

    const requestedTicketsIdsMap = new Map<string, { id: string, price: number }>();
    for (const ticket of this.requestedTickets) {
      requestedTicketsIdsMap.set(ticket.id, ticket);
    }

    // Before all things, check if the tickets are still available
    const savedTicketsData: SavedTicketDoc[] = await this.ticketRepo
      .findAllByIds(this.requestedTickets.map(reqTicket => reqTicket.id));

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
   * @returns {Promise<SavedOrderDoc>}
   * 
   * @throws {BadRequestError}  If email is already in use
   */
  async createOrder(): Promise<SavedOrderDoc> {
    const expiration = this.createExpirationDate();
    // TODO: Add Data Service for UTC and all that jazz
    const order = await this.orderRepo.create({ userId: this.userId, expiresAt: expiration, status: OrderStatusEnum.CREATED });

    return order;
  }

  /**
   * Creates a new expiration date for an order
   *
   * @returns {Date}
   */
  createExpirationDate(): Date {
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + ORDER_EXPIRATION_SECONDS);
    
    return expiration;
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
}
