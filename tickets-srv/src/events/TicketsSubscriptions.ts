/**
 * Tickets service event consumer methods
 *
 * @since event-bus-start--JP
 */
import { TicketService } from '../TicketService';
import { OrderStatusEnum } from '@bigtix/common';
import { EXCHANGE_NAME } from '@bigtix/middleware';
import {
  ServiceSubscription,
  EventTypesEnum,
  OrderCreatedData,
  OrderStatusUpdatedData,
} from '@bigtix/middleware';

const ticketSvc = new TicketService();

/**
 * Subscription for tickets-srv to consume order events
 */
export const TicketsOrderEventSubscription: ServiceSubscription = {
  queueName: 'tickets-srv.order-events',
  eventConsumers: {
    [EventTypesEnum.ORDER_CREATED]: {
      handler: async (envelope) => {
        const data = envelope.data as OrderCreatedData;
        console.log('Tickets Service received ORDER_CREATED event')
        await ticketSvc.onNewOrderEvent(data);
      },
      exchange: EXCHANGE_NAME,
    },
    [EventTypesEnum.ORDER_STATUS_CHANGED]: {
      handler: async (envelope) => {
        const data = envelope.data as OrderStatusUpdatedData;
        console.log('Tickets Service received ORDER_STATUS_CHANGED event')
        switch (data.status) {
          case OrderStatusEnum.CANCELLED:
          case OrderStatusEnum.EXPIRED:
            await ticketSvc.onOrderCancelOrExpireEvent(data);
            break;
          // There will be many other statuses to handle here...
          default:
            break;
        }
      },
      exchange: EXCHANGE_NAME,
    },
  },
};
