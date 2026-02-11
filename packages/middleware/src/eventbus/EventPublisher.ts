/**
 * Publishes events to the event bus.
 *
 * @since event-bus-start--JP
 */
import { connectToRabbitMQ } from './RabbitConnectModule';
import { EventTypesEnum } from './enums/EventsEnums';
import { EXCHANGE_NAME, DELAYED_EXCHANGE_NAME } from './consts/RabbitConsts';
import { AbstractEventFactory } from './factories/AbstractEventFactory';
import { EventDataValidators } from './validators/EventDataValidators';

export interface PublishEventOptions {
  /** Delay delivery by this many milliseconds (requires RabbitMQ Delayed Message Plugin). */
  delayMs?: number;
}

export class EventPublisher {
  constructor(private readonly eventFactory: AbstractEventFactory) {}

  /**
   * Publishes an event to the event bus.
   *
   * @param {string} queueName  The name of the queue to publish the event to (e.g. 'tickets-srv.user-events')
   * @param {EventTypesEnum} eventType  The type of the event.
   * @param {unknown} data  The data of the event.
   * @param {PublishEventOptions} [options]  Optional: e.g. delayMs to delay delivery (broker holds message).
   * @returns {Promise<void>}
   */
  async publishEvent(
    queueName: string,
    eventType: EventTypesEnum,
    data: unknown,
    options?: PublishEventOptions
  ): Promise<void> {
    try {
      const channel = await connectToRabbitMQ();

      if (!channel) throw new Error('Failed to connect to RabbitMQ');

      await channel.assertQueue(queueName, { durable: true });
      const envelope = this.eventFactory.setData(data as any).buildEvent();

      if (!this.isValidEventData(eventType, envelope.data)) throw new Error('Invalid event data: ' + JSON.stringify(envelope.data));

      console.log(
        '[EventPublisher] in pod ' + process.env.RABBITMQ_CLIENT_ID + ' publishing validated event: ',
        eventType, envelope.data
      );

      const payload = Buffer.from(JSON.stringify(envelope));
      const publishOptions = { persistent: true as const };

      if (options?.delayMs != null && options.delayMs > 0) {
        await channel.assertExchange(DELAYED_EXCHANGE_NAME, 'x-delayed-message', {
          durable: true,
          arguments: { 'x-delayed-type': 'topic' },
        });
        await channel.publish(
          DELAYED_EXCHANGE_NAME,
          eventType,
          payload,
          { ...publishOptions, headers: { 'x-delay': options.delayMs } }
        );
      } else {
        await channel.publish(EXCHANGE_NAME, eventType, payload, publishOptions);
      }
    } catch (error) {
      // TODO: Log the error to a file or database
      console.error('Error publishing event: ', error);

      throw error;
    }
  }

  /**
   * Validates the event data against the event type.
   *
   * @param eventType - The event type to validate the data against.
   * @param data - The data to validate.
   * @returns true if the data is valid, false otherwise.
   */
  private isValidEventData(eventType: EventTypesEnum, data: unknown): boolean {
    const validator = eventType ? EventDataValidators[eventType] : undefined;

    return validator ? validator(data) : false;
  }
}
