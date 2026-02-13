/**
 * Orders service event consumer methods
 *
 * @since orders-srv-start--JP
 */
import { OrderService } from '../OrderService';
import { EXCHANGE_NAME, DELAYED_EXCHANGE_NAME } from '@bigtix/middleware';
import {
  ServiceSubscription,
  EventTypesEnum,
  TicketCreatedData,
  TicketUpdatedData,
  OrderExpiredData,
  PaymentCreatedData,
  PaymentSucceededData,
  PaymentFailedData,
} from '@bigtix/middleware';

const orderSvc = new OrderService();

/**
 * Subscription for orders-srv to consume ticket events
 */
export const OrdersTicketEventSubscription: ServiceSubscription = {
  queueName: 'orders-srv.ticket-events',
  eventConsumers: {
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
        console.log('Order Service received TICKET_CREATED event')
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
        console.log('Order Service received TICKET_UPDATED event')
        await orderSvc.onTicketUpdatedEvent(data);
      },
      exchange: EXCHANGE_NAME,
    },
  },
};

/**
 * Subscription for orders-srv to consume order events
 */
export const OrdersOrderEventSubscription: ServiceSubscription = {
  queueName: 'orders-srv.order-events',
  eventConsumers: {
    /**
     * Orders service handles an incoming order expiration event. This event is sent out by Orders service with a delay for
     * publishing the event to RabbitMQ. It receives it at the expiration time and expires the order.
     *
     * @param envelope 
     */
    [EventTypesEnum.ORDER_EXPIRED]: {
      handler: async (envelope) => {
        const data = envelope.data as OrderExpiredData;
        console.log('Order Service received ORDER_EXPIRED event')
        await orderSvc.onOrderExpirationEvent(data);
      },
      exchange: DELAYED_EXCHANGE_NAME,
    },
  },
};

/**
 * Subscription for orders-srv to consume payment events
 */
export const OrdersPaymentEventSubscription: ServiceSubscription = {
  queueName: 'orders-srv.payment-events',
  eventConsumers: {
    /**
     * Orders service handles an incoming payment created event. This event is sent out by Payments service to notify
     * Orders service that a payment has been created for an order.
     *
     * @param envelope 
     */
    [EventTypesEnum.PAYMENT_CREATED]: {
      handler: async (envelope) => {
        const data = envelope.data as PaymentCreatedData;
        console.log('Order Service received PAYMENT_CREATED event')
        await orderSvc.onPaymentStatusUpdatedEvent(EventTypesEnum.PAYMENT_CREATED, data);
      },
      exchange: EXCHANGE_NAME,
    },
    [EventTypesEnum.PAYMENT_SUCCEEDED]: {
      handler: async (envelope) => {
        const data = envelope.data as PaymentSucceededData;
        console.log('Order Service received PAYMENT_SUCCEEDED event')
        await orderSvc.onPaymentStatusUpdatedEvent(EventTypesEnum.PAYMENT_SUCCEEDED, data);
      },
      exchange: EXCHANGE_NAME,
    },
    [EventTypesEnum.PAYMENT_FAILED]: {
      handler: async (envelope) => {
        const data = envelope.data as PaymentFailedData;
        console.log('Order Service received PAYMENT_FAILED event')
        await orderSvc.onPaymentStatusUpdatedEvent(EventTypesEnum.PAYMENT_FAILED, data);
      },
      exchange: EXCHANGE_NAME,
    },
  },
};
