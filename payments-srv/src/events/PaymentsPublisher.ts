/**
 * Holds all logic for publishing events to the event bus for the payments service
 *
 * @since payments-srv-start--JP
 */
import { EventPublisher } from '@bigtix/middleware';
import { PaymentsEventDataFactory } from './PaymentsEventDataFactory';
import { EventTypesEnum } from '@bigtix/middleware';

export class PaymentsPublisher {
  /**
   * Creates an event publisher for a given event type
   *
   * @param {EventTypesEnum} eventType  The event type to create an event publisher for
   *
   * @returns {EventPublisher}
   */
  static createEventPublisher(eventType: EventTypesEnum): EventPublisher {
    return new EventPublisher(
      new PaymentsEventDataFactory(eventType)
    );
  }

  /**
   * Publishes payment created event to the event bus. This will be received by the orders service to update the order
   * status to AWAITING_PAYMENT
   *
   * @returns {Promise<void>}
   */
  static async publishPaymentCreatedEvent(orderId: string): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.PAYMENT_CREATED);
    await publisher.publishEvent('payments-srv.payment-events', EventTypesEnum.PAYMENT_CREATED, {
      orderId,
    });
  }

  /**
   * Publishes payment succeeded event to the event bus. This will be received by the orders service to update the order
   * status to PAID
   *
   * @returns {Promise<void>}
   */
  static async publishPaymentSucceededEvent(orderId: string): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.PAYMENT_SUCCEEDED);
    await publisher.publishEvent('payments-srv.payment-events', EventTypesEnum.PAYMENT_SUCCEEDED, {
      orderId,
    });
  }

  /**
   * Publishes payment failed event to the event bus. This will be received by the orders service to update the order
   * status to FAILED
   *
   * @returns {Promise<void>}
   */
  static async publishPaymentFailedEvent(orderId: string): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.PAYMENT_FAILED);
    await publisher.publishEvent('payments-srv.payment-events', EventTypesEnum.PAYMENT_FAILED, {
      orderId,
    });
  }
}
