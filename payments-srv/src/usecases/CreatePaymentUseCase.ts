/**
 * Use case class for creating a new payment in payments-srv
 *
 * @since payments-srv-start--JP
 */
import { PaymentRepository } from '../repositories/PaymentRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { NotFoundError, UnAuthorizedError, BadRequestError, ServerError } from '@bigtix/common';
import { OrderStatusEnum, PaymentStatusEnum } from '@bigtix/common';
import { SavedOrderDoc } from '../models/Order';
import { stripe } from '../lib/Stripe';
import { PaymentsPublisher } from '../events/PaymentsPublisher';

export class CreatePaymentUseCase {
  private paymentRepo: PaymentRepository;
  private orderRepo: OrderRepository;
  private userId: string;
  private confTokenId: string;
  private orderId: string;
  private requestAmount: number;

  constructor(userId: string, confirmationTokenId: string, orderId: string, amount: number) {
    this.paymentRepo = new PaymentRepository();
    this.orderRepo = new OrderRepository();
    this.userId = userId;
    this.confTokenId = confirmationTokenId;
    this.orderId = orderId;
    this.requestAmount = amount;
  }

  async execute(): Promise<{ status: PaymentStatusEnum, clientSecret: string | null }> {
    // 1. Grab the order from the database for validation and finalization
    const order = await this.fetchOrder();

    // 2. Validate the order for payment
    this.validateOrderForPaying(order);

    // 3. Finalize the payment with Stripe API (create and send the PaymentIntent)
    const result = await this.finalizePaymentOnServer();

    // 4. Determine the payment status to mark in the database, and to publish to the event bus
    const paymentStatus = this.determinePaymentStatus(result.status);

    // 5. Create a new payment in the database
    await this.createPaymentInDatabase(result.intentId, paymentStatus);

    // 6. Publish the payment created event to the event bus
    await this.publishPaymentEvent(paymentStatus);

    return {
      status: paymentStatus,
      clientSecret: result.status === PaymentStatusEnum.REQUIRES_ACTION
        ? result.clientSecret
        : null,
    };
  }

  /**
   * Fetches the order from the database
   *
   * @returns {Promise<SavedOrderDoc>}  The order
   *
   * @throws {NotFoundError}  If order is not found
   */
  private async fetchOrder(): Promise<SavedOrderDoc> {
    const order = await this.orderRepo.findById(this.orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Validates the order for charging
   *
   * @param order  The order to validate
   *
   * @throws {UnAuthorizedError}  If order does not belong to user
   * @throws {BadRequestError}  If order is not in a valid state for charging
   */
  private validateOrderForPaying(order: SavedOrderDoc): void {
    // 1. Make sure the order belongs to the user
    if (order.userId !== this.userId) {
      throw new UnAuthorizedError('Order does not belong to user');
    }

    // 2. Make sure the order is in a valid state for charging
    if ([
      OrderStatusEnum.AWAITING_PAYMENT,
      OrderStatusEnum.PAID,
      OrderStatusEnum.EXPIRED,
      OrderStatusEnum.CANCELLED,
      OrderStatusEnum.REFUNDED,
    ].includes(order.status)) {
      throw new BadRequestError('Order is not in a valid state for charging');
    }

    // 3. Make sure the payment amount matches amount due on order
    if (order.price !== this.requestAmount) {
      throw new BadRequestError('Payment amount does not match order amount');
    }
  }

  /**
   * Finalizes the payment on the server
   *
   * @returns {Promise<{ status: string, clientSecret: string }>}  The payment intent
   *
   * @throws {ServerError}  If payment fails
   */
  private async finalizePaymentOnServer(): Promise<{ intentId: string, status: string, clientSecret: string | null }> {
    try {
      // Create and Confirm the PaymentIntent in one call
      const intent = await stripe.paymentIntents.create({
        amount: 2000, // $20.00
        currency: 'usd',
        confirmation_token: this.confTokenId,
        confirm: true, // Triggers immediate confirmation
        return_url: 'https://your-site.com',
        metadata: {
          orderId: this.orderId,
        },
      });
  
      return {
        status: intent.status,
        clientSecret: intent.status === PaymentStatusEnum.REQUIRES_ACTION ? intent.client_secret : null,
        intentId: intent.id,
      };
    } catch (e) {
      throw new ServerError(e instanceof Error ? e.message : 'Unknown error in finalizePaymentOnServer');
    }
  }

  /**
   * Determines the payment status to mark in the Payment model in the database, as well as to publish to the event bus
   *
   * @param {string} intentStatus  The status of the incoming payment intent
   *
   * @returns {PaymentStatusEnum}  The payment status
   */
  private determinePaymentStatus(intentStatus: string): PaymentStatusEnum {
    switch (intentStatus) {
      /**
       * If incoming payment intent returns success, we will always wait for the incoming Stripe webhook later to
       * confirm the payment and fulfill the order. This is to avoid race conditions where the order is updated before the payment
       * is confirmed.
       */
      case PaymentStatusEnum.SUCCESS:
        return PaymentStatusEnum.PENDING;
      /**
       * If incoming payment intent returns requires_action, we will return the payment status as REQUIRES_ACTION.
       * Incoming webhook will confirm the payment and fulfill the order or indicate order failed
       */
      case PaymentStatusEnum.REQUIRES_ACTION:
        return PaymentStatusEnum.REQUIRES_ACTION;
      /**
       * If incoming payment intent returns requires_payment_method, we will mark the payment as failed and indicate
       * order as failed to orders service to update the order status to FAILED
       */
      case PaymentStatusEnum.REQUIRES_PAYMENT_METHOD:
        return PaymentStatusEnum.REQUIRES_PAYMENT_METHOD;
      default:
        throw new BadRequestError('Invalid payment intent status');
    }
  }

  /**
   * Creates a new payment in the database
   *
   * @throws {ServerError}  If charge is not created
   */
  private async createPaymentInDatabase(intentId: string, paymentStatus: PaymentStatusEnum): Promise<void> {
    await this.paymentRepo.create({
      orderId: this.orderId,
      stripePayIntentId: intentId,
      status: paymentStatus,
    });
  }

  /**
   * Publishes the payment event to the event bus
   *
   * @param {PaymentStatusEnum} paymentStatus  The payment status
   *
   * @returns {void}
   */
  private async publishPaymentEvent(paymentStatus: PaymentStatusEnum): Promise<void> {
    // If the payment status is REQUIRES_PAYMENT_METHOD, we will publish the payment failed event to the event bus
    if (paymentStatus === PaymentStatusEnum.REQUIRES_PAYMENT_METHOD) {
      await PaymentsPublisher.publishPaymentFailedEvent(this.orderId);

      return;
    }

    // Status is either PENDING or REQUIRES_ACTION, so we can publish the payment created event to event bus
    await PaymentsPublisher.publishPaymentCreatedEvent(this.orderId);
  }
}
