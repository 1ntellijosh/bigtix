/**
 * Orders service event builder.
 *
 * @since orders-srv-start--JP
 */
import { AbstractEventFactory } from '@bigtix/middleware';
import { EventTypesEnum, SourceServiceEnum } from '@bigtix/middleware';
import { OrderCreatedData, OrderStatusUpdatedData } from '@bigtix/middleware';

export class OrderEventFactory extends AbstractEventFactory {
  constructor(eventType: EventTypesEnum, correlationId?: string) {
    super(eventType, SourceServiceEnum.ORDERS_SRV, correlationId);
  }

  /**
   * @inheritdoc
   */
  createEventData(eventType: EventTypesEnum, data: any): OrderCreatedData | OrderStatusUpdatedData {
    switch (eventType) {
      case EventTypesEnum.ORDER_CREATED:
        return {
          orderId: data.orderId,
          userId: data.userId,
          tickets: data.tickets,
          expiresAt: data.expiresAt,
          status: data.status,
        } as OrderCreatedData;
      case EventTypesEnum.ORDER_STATUS_CHANGED:
        return {
          orderId: data.orderId,
          status: data.status,
        } as OrderStatusUpdatedData;
      default:
        throw new Error(`Event type ${eventType} not supported`);
    }
  }
}
