/**
 * Payments service event consumer methods
 *
 * @since payments-srv-start--JP
 */
import { OrderStatusEnum } from '@bigtix/common';
import { PaymentService } from '../PaymentService';
import { EXCHANGE_NAME } from '@bigtix/middleware';
import {
  ServiceSubscription,
  EventTypesEnum,
  OrderCreatedData,
  OrderStatusUpdatedData,
} from '@bigtix/middleware';

const paymentsSvc = new PaymentService();

/**
 * Subscription for payments-srv to consume order events
 */
export const PaymentsOrderEventSubscription: ServiceSubscription = {
  queueName: 'payments-srv.order-events',
  eventConsumers: {
    /**
     * Payments service handles an incoming order creation event.
     *
     * @param envelope 
     */
    [EventTypesEnum.ORDER_CREATED]: {
      handler: async (envelope) => {
        const data = envelope.data as OrderCreatedData;
        console.log('Payments Service received ORDER_CREATED event')
        await paymentsSvc.onOrderCreatedEvent(data);
      },
      exchange: EXCHANGE_NAME,
    },
    /**
     * Payments service handles an incoming order cancellation/expired/failed event.
     *
     * @param envelope 
     */
    [EventTypesEnum.ORDER_STATUS_CHANGED]: {
      handler: async (envelope) => {
        const data = envelope.data as OrderStatusUpdatedData;
        console.log('Payments Service received ORDER_STATUS_CHANGED event')
        switch (data.status) {
          case OrderStatusEnum.CANCELLED:
          case OrderStatusEnum.EXPIRED:
          case OrderStatusEnum.FAILED:
          case OrderStatusEnum.AWAITING_PAYMENT:
          case OrderStatusEnum.PAID:
            await paymentsSvc.onOrderStatusChangedEvent(data);
            break;
          default:
            break;
        }
      },
      exchange: EXCHANGE_NAME,
    },
  },
};
