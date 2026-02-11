/**
 * Tickets service event consumer methods
 *
 * @since event-bus-start--JP
 */
import {
  EventConsumerMap,
  EventTypesEnum,
  OrderCreatedData,
  OrderStatusUpdatedData,
} from '@bigtix/middleware';
import { TicketService } from '../TicketService';
import { OrderStatusEnum } from '@bigtix/common';
import { EXCHANGE_NAME } from '@bigtix/middleware';

const ticketSvc = new TicketService();

/**
 * 'tickets-srv.order-events' queue...
 */
export const OrderEventHandlers: Partial<EventConsumerMap> = {
  [EventTypesEnum.ORDER_CREATED]: {
    handler: async (envelope) => {
      const data = envelope.data as OrderCreatedData;
      console.log('Tickets service received order created event:', data);
      await ticketSvc.onNewOrderEvent(data);
    },
    exchange: EXCHANGE_NAME,
  },
  [EventTypesEnum.ORDER_STATUS_CHANGED]: {
    handler: async (envelope) => {
      const data = envelope.data as OrderStatusUpdatedData;
      console.log('Tickets service received order status changed event:', data);
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
};
