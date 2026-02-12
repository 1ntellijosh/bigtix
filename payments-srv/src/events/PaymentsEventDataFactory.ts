/**
 * Payments service event builder.
 *
 * @since payments-srv-start--JP
 */
import { AbstractEventFactory } from '@bigtix/middleware';
import { EventTypesEnum, SourceServiceEnum } from '@bigtix/middleware';
import { PaymentCreatedData, PaymentSucceededData, PaymentFailedData } from '@bigtix/middleware';

export class PaymentsEventDataFactory extends AbstractEventFactory {
  constructor(eventType: EventTypesEnum, correlationId?: string) {
    super(eventType, SourceServiceEnum.PAYMENTS_SRV, correlationId);
  }

  /**
   * @inheritdoc
   */
  createEventData(eventType: EventTypesEnum, data: any): PaymentCreatedData | PaymentSucceededData | PaymentFailedData {
    switch (eventType) {
      case EventTypesEnum.PAYMENT_CREATED:
        return { orderId: data.orderId } as PaymentCreatedData;
      case EventTypesEnum.PAYMENT_SUCCEEDED:
        return { orderId: data.orderId } as PaymentSucceededData;
      case EventTypesEnum.PAYMENT_FAILED:
        return { orderId: data.orderId } as PaymentFailedData;
      default:
        throw new Error(`Event type ${eventType} not supported`);
    }
  }
}
