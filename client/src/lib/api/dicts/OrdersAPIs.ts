/**
 * API dictionary for calls to the orders microservice
 * 
 * @since buy-tickets--JP
 */
import { HttpService } from '../HttpService';

export const OrdersAPIs: { [key: string]: (body?: any, config?: Record<string, any>, params?: Record<string, any>) => Promise<Response> } = {
  /**
   * Creates a new order and reserves the tickets for the order, or sends an error response if the ticket is not available.
   *
   * @param {object} body  The body of the request
   *   @prop {array<Object>} ticketId  The id of the ticket to order
   *
   * @returns {Promise<Response>}
   */
  createOrderAndReserveTickets: function (body: any, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post(`/api/orders/create`, body, config) as Promise<Response>;
  },
};
