/**
 * Publishes events to the event bus.
 *
 * @since event-bus-start--JP
 */
import { connectToRabbitMQ } from './RabbitConnectModule';
import { EventTypesEnum, EXCHANGE_NAME } from './enums/EventsEnums';
import { AbstractEventFactory } from './factories/AbstractEventFactory';
import { EventDataValidators } from './validators/EventDataValidators';

export class EventPublisher {
  constructor(private readonly eventFactory: AbstractEventFactory) {}

  /**
   * Publishes an event to the event bus.
   *
   * @param {string} queueName  The name of the queue to publish the event to (e.g. 'tickets-srv.user-events')
   * @param {EventTypesEnum} eventType  The type of the event.
   * @param {unknown} data  The data of the event.
   *
   * @returns {Promise<void>}
   */
  async publishEvent(queueName: string, eventType: EventTypesEnum, data: unknown): Promise<void> {
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

      await channel.publish(EXCHANGE_NAME, eventType, Buffer.from(JSON.stringify(envelope)), { persistent: true });

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
