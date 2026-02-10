/**
 * Orders service event consumer methods
 *
 * @since orders-srv-start--JP
 */
import { OrderService } from '../OrderService';
import {
  EventConsumerMap,
  EventTypesEnum,
  TicketCreatedData,
  TicketUpdatedData,
  TicketDeletedData,
} from '@bigtix/middleware';

const orderSvc = new OrderService();

/**
 * 'orders-srv.ticket-events' queue...
 */
export const TicketEventConsumers: Partial<EventConsumerMap> = {
  /**
   * Orders service saves its own version of a new ticket from a ticket creation event sent from ticket-srv
   *
   * @param envelope 
   *
   * @throws {ServerError} if the ticket cannot be created (will cause the event to be retried again later by the event bus)
   */
  [EventTypesEnum.TICKET_CREATED]: async (envelope) => {
    const data = envelope.data as TicketCreatedData;
    console.log('Orders service received ticket created event:', data);
    await orderSvc.createTicketFromEvent(data);
  },
  /**
   * Orders service updates its own version of a ticket from a ticket update event sent from ticket-srv
   * 
   * @param envelope 
   *
   * @throws {ServerError} if the ticket cannot be updated (will cause the event to be retried again later by the event bus)
   */
  [EventTypesEnum.TICKET_UPDATED]: async (envelope) => {
    const data = envelope.data as TicketUpdatedData;
    console.log('Orders service received ticket updated event:', data);
    await orderSvc.updateTicketFromEvent(data);
  },
};
