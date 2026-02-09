/**
 * Consumes incoming events from a queue and dispatches them to the registered handlers.
 *
 * @since event-bus-start--JP
 */
import amqplib from 'amqplib';
import { EXCHANGE_NAME } from './enums/EventsEnums';
import { EventTypesEnum } from './enums/EventsEnums';
import { EventEnvelope, EventData, EventConsumerMap } from './contracts/EventContracts';
import { EventDataValidators } from './validators/EventDataValidators';

export type EventHandler = (envelope: EventEnvelope) => Promise<void>;

/**
 * Consume events from a queue and dispatch to handlers registered per event type.
 * Usage:
 *   const consumer = new EventConsumer(channel);
 *   consumer.on(EventTypesEnum.USER_CREATED, async (envelope) => {
 *     const data = envelope.data as UserIdentityData;
 *     // ...
 *   });
 *   await consumer.startConsuming('tickets-srv.user-events', [EventTypesEnum.USER_CREATED]);
 */
export class EventConsumer {
  private handlers = new Map<EventTypesEnum, EventHandler>();

  constructor(private channel: amqplib.Channel) {}

  /**
   * Registers a map of event consumers.
   *
   * @param eventConsumers - The map of event consumers to register.
   * @returns this for chaining.
   */
  registerEventConsumers(eventConsumers: EventConsumerMap): this {
    for (const [eventType, handler] of Object.entries(eventConsumers)) {
      this.on(eventType as EventTypesEnum, handler);
    }

    return this;
  }

  /**
   * Registers a handler for a given event type. Use the generic to type the envelope in your handler,
   * e.g. .on(EventTypesEnum.USER_DEACTIVATED, (envelope: EventEnvelope<UserActivationStatusData>) => ...).
   *
   * @param eventType - The event type to register the handler for.
   * @param handler - The handler; receives envelope dispatched for that event type.
   * @returns this for chaining.
   */
  on<T extends EventData = EventData>(eventType: EventTypesEnum, handler: (envelope: EventEnvelope<T>) => Promise<void>): this {
    this.handlers.set(eventType, handler as EventHandler);

    return this;
  }

  /**
   * Starts a queue with given queueName, binds it to the exchange for the given routing keys (EventTypesEnum),
   * and consumes events from the queue that match the routing keys and the registered handlers.
   *
   * @param {string} queueName - The name of the queue to consume from.
   * @param {Object} options - The options for the queue.
   * @param {boolean} options.durable - Whether the queue should be durable.
   *
   * @returns {Promise<void>} - A promise that resolves when the consumption starts.
   */
  async startConsuming(
    queueName: string,
    options?: { durable?: boolean }
  ): Promise<void> {
    if (this.handlers.size === 0) {
      throw new Error('No event consumers to bind to the queue');
    }

    const routingKeys: EventTypesEnum[] = Array.from(this.handlers.keys()) as unknown as EventTypesEnum[];
    const durable = options?.durable ?? true;
    await this.channel.assertQueue(queueName, { durable });

    for (const key of routingKeys) {
      await this.channel.bindQueue(queueName, EXCHANGE_NAME, key);
    }

    await this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const envelope = JSON.parse(msg.content.toString()) as EventEnvelope;
          const eventType = envelope.metadata?.eventType as EventTypesEnum | undefined;
          const handler = eventType ? this.handlers.get(eventType) : undefined;

          // Diagnostic: log every message received (helps confirm messages reach this service)
          console.log(
            '[EventConsumer] in pod ' + process.env.RABBITMQ_CLIENT_ID + ' received message:',
            { queueName, eventType, hasHandler: !!handler, data: envelope.data }
          );

          if (eventType && !this.isValidEventData(eventType, envelope.data)) {
            // Data does not match contract; ack to avoid redelivery, skip handler
            console.warn('[EventConsumer] validation failed, skipping handler', { eventType, data: envelope.data });
            this.channel.ack(msg);
            return;
          }

          if (handler) {
            await handler(envelope);
            /**
             * TODO: Save all processed events to a file or database for:
             * - Audit purposes
             * - Event history for if I introduce a new service in the future, that would need full event history
             */
            this.channel.ack(msg);
          } else {
            // TODO: Log the event type that was not handled
            this.channel.ack(msg);
          }
        } catch (err) {
          this.channel.nack(msg, false, true); // requeue for retry
        }
      },
      { noAck: false }
    );
  }

  /**
   * Validates the event data against the event type.
   *
   * @param eventType - The event type to validate the data against.
   * @param data - The data to validate.
   * @returns true if the data is valid, false otherwise.
   */
  private isValidEventData(eventType: EventTypesEnum, data: unknown): boolean {
    const validator = EventDataValidators[eventType];
    // No validator for this event type => allow (don't drop new event types)
    if (!validator) return true;
    return validator(data);
  }
}
