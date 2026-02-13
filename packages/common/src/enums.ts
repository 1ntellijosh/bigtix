/**
 * Shared enums for BigTix platform (client + server)
 *
 * @since next-client--JP
 */

// Handled status codes in this app
export enum STATUS_CODES {
  SUCCESS = 200,
  CREATED = 201,
  FOUND = 302, // Redirect
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  REQUEST_TIMEOUT = 408,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  NO_RESPONSE = 0, // No HTTP response (e.g. network failure, CORS, timeout before response)
}

/**
 * Statuses for an BigTix order
 *
 * @since payments-srv-start--JP
 */
export enum OrderStatusEnum {
  CREATED = 'created',
  AWAITING_PAYMENT = 'awaiting:payment',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled', // Order failed, or user cancelled the order
  FAILED = 'failed', // Order failed, or user cancelled the order
  REFUNDED = 'refunded',
}

/**
 * Statuses for a payment (these are Stripe API statuses, except for initial state of PENDING)
 *
 * @since payments-srv-start--JP
 */
export enum PaymentStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'succeeded',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
}
