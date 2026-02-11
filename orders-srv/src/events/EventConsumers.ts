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
  OrderExpiredData,
} from '@bigtix/middleware';
import { EXCHANGE_NAME, DELAYED_EXCHANGE_NAME } from '@bigtix/middleware';

const orderSvc = new OrderService();

/**
 * 'orders-srv.ticket-events' queue...
 */
export const TicketEventHandlers: Partial<EventConsumerMap> = {
  /**
   * Orders service saves its own version of a new ticket from a ticket creation event sent from ticket-srv
   *
   * @param envelope 
   *
   * @throws {ServerError} if the ticket cannot be created (will cause the event to be retried again later by the event bus)
   */
  [EventTypesEnum.TICKET_CREATED]: {
    handler: async (envelope) => {
      const data = envelope.data as TicketCreatedData;
      console.log('Orders service received ticket created event:', data);
      await orderSvc.onTicketCreatedEvent(data);
    },
    exchange: EXCHANGE_NAME,
  },
  /**
   * Orders service updates its own version of a ticket from a ticket update event sent from ticket-srv
   * 
   * @param envelope 
   *
   * @throws {ServerError} if the ticket cannot be updated (will cause the event to be retried again later by the event bus)
   */
  [EventTypesEnum.TICKET_UPDATED]: {
    handler: async (envelope) => {
      const data = envelope.data as TicketUpdatedData;
      console.log('Orders service received ticket updated event:', data);
      await orderSvc.onTicketUpdatedEvent(data);
    },
    exchange: EXCHANGE_NAME,
  },
};

/**
 * 'orders-srv.order-events' queue...
 */
export const OrderEventHandlers: Partial<EventConsumerMap> = {
  /**
   * Orders service handles an incoming order expiration event. This event is sent out by Orders service with a delay for
   * publishing the event to RabbitMQ. It receives it at the expiration time and expires the order.
   *
   * @param envelope 
   */
  [EventTypesEnum.ORDER_EXPIRED]: {
    handler: async (envelope) => {
      const data = envelope.data as OrderExpiredData;
      console.log('Orders service received order expired event:', data);
      await orderSvc.onOrderExpirationEvent(data);
    },
    exchange: DELAYED_EXCHANGE_NAME,
  },
};
