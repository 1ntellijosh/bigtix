/**
 * Use case class for handling a Stripe webhook in payments-srv
 *
 * @since payments-srv-start--JP
 */
import { PaymentRepository } from '../repositories/PaymentRepository';
import { BadRequestError, ServerError, NotFoundError } from '@bigtix/common';
import { PaymentStatusEnum } from '@bigtix/common';
import { stripe } from '../lib/Stripe';
import { PaymentsPublisher } from '../events/PaymentsPublisher';


export class StripeWebhookUseCase {
  private paymentRepo: PaymentRepository;
  private intent?: any;
  private type?: string;
  private orderId?: string;

  constructor() {
    this.paymentRepo = new PaymentRepository();
  }

  /**
   * Handles an incoming Stripe payment intent webhook
   *
   * @param {string} rawBody  The raw body of the webhook
   * @param {string} sig  The signature of the webhook
   *
   * @returns {Promise<void>}
   */
  async execute(rawBody: string, sig: string): Promise<void> {
    this.extractEventFromStripeWebhook(rawBody, sig);

    if (!this.orderId) throw new ServerError('Order ID is not set');
    if (!this.type) throw new ServerError('Event type is not set');
    if (!this.intent) throw new ServerError('Intent is not set');

    await this.handleStripeWebhookEvent();
  }

  /**
   * Extracts the event from the Stripe webhook raw body and signature
   *
   * @param {string} rawBody  The raw body of the webhook
   * @param {string} sig  The signature of the webhook
   *
   * @returns {Promise<{ data: { object: any }, type: string }>}
   */
  private extractEventFromStripeWebhook(rawBody: string, sig: string): StripeWebhookUseCase {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) throw new ServerError('STRIPE_WEBHOOK_SECRET is not set');

    try {
      const event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      this.intent = event.data.object;
      this.type = event.type;
      this.orderId = (this.intent as any).metadata.orderId;
    } catch (err) {
      // TODO: Log the error
      const message = `Stripe Webhook Error: ${err instanceof Error
        ? err.message
        : 'Error parsing Stripe webhook request. Raw body or signature is invalid, or request is from untrusted source.'
      }`;
      console.error(message);
      throw new BadRequestError(message);
    }

    return this;
  }

  /**
   * Handles the payment intent succeeded event
   *
   * @returns {Promise<void>}
   */
  private async handleStripeWebhookEvent(): Promise<void> {
    switch (this.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentIntentSucceeded();
        break;
      case 'payment_intent.payment_failed':
        await this.onPaymentIntentFailed();
        break;
      default:
        console.log(`Unhandled event type ${this.type}`);
    }
  }

  /**
   * Handles the payment intent succeeded event
   *
   * @returns {Promise<void>}
   */
  private async onPaymentIntentSucceeded(): Promise<void> {
    await this.markPaymentAsPaid();
    
    await PaymentsPublisher.publishPaymentSucceededEvent(this.orderId!);
  }

  /**
   * Marks the payment as paid
   *
   * @returns {Promise<void>}
   */
  private async markPaymentAsPaid(): Promise<void> {
    const payment = await this.paymentRepo.findByOrderId(this.orderId!);

    if (!payment) throw new NotFoundError('Payment not found');

    /**
     * Avoids implementing idempotency for the payment status update (Stripe can send the webhook multiple times). We
     * want to avoid updating the payment status if it is already paid, because we want to avoid triggering paid order
     * logistics events (like emailing the user) multiple times.
     */
    if (payment.status === PaymentStatusEnum.SUCCESS) return;

    await this.paymentRepo.updateByOrderId(this.orderId!, { status: PaymentStatusEnum.SUCCESS });
  }

  /**
   * Handles the payment intent failed event
   *
   * @returns {Promise<void>}
   */
  private async onPaymentIntentFailed(): Promise<void> {
    await this.markPaymentAsFailed();

    await PaymentsPublisher.publishPaymentFailedEvent(this.orderId!);
  }

  /**
   * Marks the payment as failed
   *
   * @returns {Promise<void>}
   */
  private async markPaymentAsFailed(): Promise<void> {
    const payment = await this.paymentRepo.findByOrderId(this.orderId!);

    if (!payment) throw new NotFoundError('Payment not found');

    /**
     * Avoids implementing idempotency for the payment status update (Stripe can send the webhook multiple times). We
     * want to avoid updating the payment status if it is already failed, because we want to avoid triggering failed order
     * logistics events (like emailing the user) multiple times.
     */
    if (payment.status === PaymentStatusEnum.REQUIRES_PAYMENT_METHOD) return;

    await this.paymentRepo.updateByOrderId(this.orderId!, { status: PaymentStatusEnum.REQUIRES_PAYMENT_METHOD });
  }
}
