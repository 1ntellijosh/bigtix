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

const ticketSvc = new TicketService();

/**
 * 'tickets-srv.order-events' queue...
 */
export const OrderEventConsumers: Partial<EventConsumerMap> = {
  [EventTypesEnum.ORDER_CREATED]: async (envelope) => {
    const data = envelope.data as OrderCreatedData;
    console.log('Tickets service received order created event:', data);
    await ticketSvc.applyNewOrderToTicketsEvent(data);
  },
  [EventTypesEnum.ORDER_STATUS_CHANGED]: async (envelope) => {
    const data = envelope.data as OrderStatusUpdatedData;
    console.log('Tickets service received order status changed event:', data);
    switch (data.status) {
      case OrderStatusEnum.CANCELLED:
        await ticketSvc.applyOrderCancelledToTicketsEvent(data);
        break;
      // There will be many other statuses to handle here...
      default:
        break;
    }
  },
};
