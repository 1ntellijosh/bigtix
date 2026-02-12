/**
 * Order and Ticket query service for orders-srv
 *
 * @since service-clean--JP
 */
import { NotFoundError } from '@bigtix/common';
import { OrderRepository } from '../repositories/OrderRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { OrderMapper, OrderWithTicketsDto } from './OrderMapper';
import { SavedOrderDoc } from '../models/Order';

export class OrdersQueryService {
  private orderRepo: OrderRepository;
  private ticketRepo: TicketRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.ticketRepo = new TicketRepository();
  }

  /**
   * Fetches an order by id with its tickets.
   *
   * @param {string} id  The id of the order to fetch
   *
   * @returns {Promise<OrderWithTicketsDto>}  The order with tickets
   *
   * @throws {NotFoundError}  If the order or tickets are not found
   */
  async getOrderById(id: string): Promise<OrderWithTicketsDto> {
    const order = await this.orderRepo.findById(id);

    if (!order) throw new NotFoundError('Order not found');

    const tickets = await this.ticketRepo.findAllByOrderId(order.id);
    if (!tickets || tickets.length === 0) throw new NotFoundError('Tickets for an order not found');

    return OrderMapper.toOrderWithTickets(order, tickets);
  }

  /**
   * Fetches all orders for a user with their tickets
   *
   * @param {string} userId  The id of the user to fetch orders for
   *
   * @returns {Promise<OrderWithTicketsDto[]>}  The orders with tickets
   *
   * @throws {NotFoundError}  If the orders or tickets are not found
   */
  async getOrdersByUserId(userId: string): Promise<OrderWithTicketsDto[]> {
    const orders = await this.orderRepo.findByUserId(userId);

    if (!orders || orders.length === 0) throw new NotFoundError('Orders not found');

    const result: OrderWithTicketsDto[] = [];
    for (const order of orders) {
      const tickets = await this.ticketRepo.findAllByOrderId(order.id);
      if (!tickets || tickets.length === 0) throw new NotFoundError('Tickets for an order not found');
      result.push(OrderMapper.toOrderWithTickets(order, tickets));
    }
    return result;
  }

  /**
   * Fetches all orders
   *
   * @returns {Promise<SavedOrderDoc[]>}  The orders without tickets
   */
  async getAllOrders(): Promise<SavedOrderDoc[]> {
    const orders = await this.orderRepo.findAll();

    return orders && orders.length > 0
      ? orders
      : [];
  }
}
