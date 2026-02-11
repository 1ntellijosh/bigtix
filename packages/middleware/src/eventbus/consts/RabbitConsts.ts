/**
 * Constants for BigTix event bus (RabbitMQ).
 *
 * @since order-expiration--JP
 */

/** Main event bus exchange name. */
export const EXCHANGE_NAME = 'bigtix.main.eventbus';

/** Delayed event bus exchange name. */
export const DELAYED_EXCHANGE_NAME = 'bigtix.main.eventbus.delayed';