/**
 * Exchange and event type constants for BigTix event bus (RabbitMQ).
 * Event types double as routing keys for topic/direct exchanges.
 *
 * @since event-bus-start--JP
 */

export enum SourceServiceEnum {
  AUTH_SRV = 'auth-srv',
  TICKETS_SRV = 'tickets-srv',
  ORDERS_SRV = 'orders-srv',
  PAYMENTS_SRV = 'payments-srv',
}

export enum EventTypesEnum {
  USER_CREATED = 'user.created',
  USER_SIGNED_IN = 'user.signedin',
  USER_SIGNED_OUT = 'user.signedout',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_DEACTIVATED = 'user.deactivated',
  USER_REACTIVATED = 'user.reactivated',
  TICKET_CREATED = 'ticket.created',
  TICKET_UPDATED = 'ticket.updated',
  TICKET_DELETED = 'ticket.deleted',
  TICKET_CANCELLED = 'ticket.cancelled',
  ORDER_CREATED = 'order.created',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  ORDER_EXPIRED = 'order.expired',
  PAYMENT_CREATED = 'charge.created',
  PAYMENT_SUCCEEDED = 'charge.succeeded',
  PAYMENT_FAILED = 'charge.failed',
}
