/**
 * Event envelope contract for BigTix platform (microservice-to-microservice over RabbitMQ).
 * Wire format: serializable JSON; timestamps as ISO 8601 strings for cross-service compatibility.
 *
 * @since event-bus-start--JP
 */
import { EventTypesEnum, SourceServiceEnum } from '../enums/EventsEnums';
import { EXCHANGE_NAME, DELAYED_EXCHANGE_NAME } from '../consts/RabbitConsts';

/**
 * Schema version for the envelope;
 * - Need to update if metadata shape changes.
 * - This will enable consumers to support multiple versions.
 */
export const EVENT_SCHEMA_VERSION = 1;

export interface EventMetadata {
  eventId: string;
  eventType: EventTypesEnum;
  /** ISO 8601 string (e.g. new Date().toISOString()). Use string on the wire so all consumers parse consistently. */
  eventTimestamp: string;
  sourceService: SourceServiceEnum;
  schemaVersion: number;
  /** Optional: for distributed tracing / request correlation. */
  correlationId?: string;
}

/** Event payloads: plain serializable objects only (no Date, no class instances). */
export interface EventData {}

/**
 * Envelope for all events: metadata + typed data. Serialize with JSON.stringify for RabbitMQ.
 * Use generic EventEnvelope<YourData> for typed publish/consume.
 */
export interface EventEnvelope<T extends EventData = EventData> {
  metadata: EventMetadata;
  data: T;
}

/**
 * Map of event types to their consumer functions, passed to EventConsumer.registerEventConsumers().
 * Usage:
 *   const consumer = new EventConsumer(channel);
 *   await consumer.registerEventConsumers({
 *     [EventTypesEnum.USER_CREATED]: async (envelope) => {
 *       const data = envelope.data as UserIdentityData;
 *       // ...
 *     },
 *   }).startConsuming('auth-srv.user-events');
 */
export type EventConsumerMap = {
  [key in EventTypesEnum]: {
    handler: (envelope: EventEnvelope<EventData>) => Promise<void>,
    exchange: typeof EXCHANGE_NAME | typeof DELAYED_EXCHANGE_NAME;
  };
};
