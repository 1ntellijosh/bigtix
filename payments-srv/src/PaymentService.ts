/**
 * Class for Payments Service business logic
 *
 * @since payments-srv-start--JP
 */
import { PaymentRepository } from './repositories/PaymentRepository';
import { OrderRepository } from './repositories/OrderRepository';
import { NotFoundError, BadRequestError, ServerError } from '@bigtix/common';
import { OrderCreatedData, OrderStatusUpdatedData } from '@bigtix/middleware';
import { PaymentStatusEnum } from '@bigtix/common';
import { CreatePaymentUseCase } from './usecases/CreatePaymentUseCase';
import { StripeWebhookUseCase } from './usecases/StripeWebhookUseCase';

export class PaymentService {
  private paymentRepo: PaymentRepository;
  private orderRepo: OrderRepository;

  constructor() {
    this.paymentRepo = new PaymentRepository();
    this.orderRepo = new OrderRepository();
  }

  /**
   * Creates a new payment for an order
   *
   * @param {string} userId
   * @param {string} confirmationTokenId  Stripe confirmation token ID made between client and server for the payment
   * @param {string} orderId
   * @param {number} amount
   *
   * @returns {Promise<SavedOrderDoc>}
   *
   * @throws {ServerError}  If order is not created successfully
   */
  async createPaymentForOrder(userId: string, confirmationTokenId: string, orderId: string, amount: number): Promise<{ status: PaymentStatusEnum, clientSecret: string | null }> {
    const createPaymentUseCase = new CreatePaymentUseCase(userId, confirmationTokenId, orderId, amount);

    const result = await createPaymentUseCase.execute();

    return result;
  }

  /**
   * Handles an incoming Stripe webhook
   *
   * @param {string} rawBody  The raw body of the webhook
   * @param {string} sig  The signature of the webhook
   *
   * @returns {Promise<void>}
   */
  async onReceivedStripeWebhook(rawBody: string, sig: string): Promise<void> {
    const stripeWebhookUseCase = new StripeWebhookUseCase();

    const result = await stripeWebhookUseCase.execute(rawBody, sig);

    return result;
  }

  /**
   * Handles an incoming order creation event. Creates a new order in the database, so payment service can create and
   * process payments for this order.
   *
   * @param {OrderCreatedData} data  The order creation data
   *
   * @returns {Promise<void>}
   */
  async onOrderCreatedEvent(data: OrderCreatedData): Promise<void> {
    try {
      const { orderId, userId, tickets, status } = data;

      const totalPrice = this.calculateTotalPrice(tickets);

      await this.orderRepo.create({
        id: orderId,
        userId,
        status,
        price: totalPrice,
      });
    } catch (error) {
      console.error('Error in PaymentService onOrderCreatedEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process PaymentService onOrderCreatedEvent event: ' + error.message
        : 'Unknown error executing onOrderCreatedEvent in PaymentService';

      throw new ServerError(msg);
    }
  }

  /**
   * Calculates the total price of a given array of tickets
   *
   * @param {Array<{ id: string, price: number }>} tickets  The tickets to calculate the total price of
   *
   * @returns {number}  The total price of the tickets
   */
  private calculateTotalPrice(tickets: Array<{ ticketId: string, price: number }>): number {
    return tickets.reduce((acc, ticket) => acc + ticket.price, 0);
  }

  /**
   * Handles an incoming order status changed event. Updates payment services order model to be the same status as 
   * order services order model.
   *
   * @param {OrderStatusUpdatedData} data  The order status updated data
   *
   * @returns {Promise<void>}
   */
  async onOrderStatusChangedEvent(data: OrderStatusUpdatedData): Promise<void> {
    try {
      const { orderId, status } = data;

      const order = await this.orderRepo.findById(orderId);

      if (!order) throw new NotFoundError('Order not found');

      // Order version must be the next version
      if (data.version !== (order.version + 1)) throw new BadRequestError('Order version mismatch');

      await this.orderRepo.updateById(orderId, { status, version: data.version });
    } catch (error) {
      console.error('Error in PaymentService onOrderStatusChangedEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process PaymentService onOrderStatusChangedEvent event: ' + error.message
        : 'Unknown error executing onOrderStatusChangedEvent in PaymentService';

      throw new ServerError(msg);
    }
  }
}
