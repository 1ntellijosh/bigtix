/**
 * Orders service event consumer methods
 *
 * @since orders-srv-start--JP
 */
import { EventConsumerMap, EventTypesEnum, TicketUpdatedData } from '@bigtix/middleware';

/**
 * 'orders-srv.ticket-events' queue...
 */
export const OrdersTicketEventConsumers: Partial<EventConsumerMap> = {
  [EventTypesEnum.TICKET_UPDATED]: async (envelope) => {
    const data = envelope.data as TicketUpdatedData;
    // handle user created (e.g. sync user into local store if needed)
  },
};
