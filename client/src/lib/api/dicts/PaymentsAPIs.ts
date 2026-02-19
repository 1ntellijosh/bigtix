/**
 * API dictionary for calls to the payments microservice
 * 
 * @since buy-tickets--JP
 */
import { HttpService } from '../HttpService';

export const PaymentsAPIs: { [key: string]: (body?: any, config?: Record<string, any>, params?: Record<string, any>) => Promise<Response> } = {
  /**
   * Finalizes a payment for an order. Calls Stripe API to create and confirm the PaymentIntent created on the client
   * side.
   *
   * @param {object} body  Request body: { orderId, amount, confirmationTokenId }
   * @returns {Promise<Response>}
   */
  finalizePaymentOnServer: function (body?: { orderId: string; amount: number; confirmationTokenId: string }, config?: Record<string, any>): Promise<Response> {
    return HttpService.post(`/api/payments/new`, body ?? {}, config) as Promise<Response>;
  },
};
