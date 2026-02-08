/**
 * RabbitMQ connection module used to connect to the RabbitMQ server via amqplib in every microservice.
 * Singleton pattern for each microservice to ensure only one connection is created and used throughout the application.
 *
 * @since event-bus-start--JP
 */
import amqplib from 'amqplib';
import { EXCHANGE_NAME } from './enums/EventsEnums';
import { EventEnvelope } from './contracts/EventContracts';

let connection: amqplib.ChannelModel | null = null;
let channel: amqplib.Channel | null = null;

/**
 * Connect to the RabbitMQ server and create a channel.
 *
 * @returns {Promise<amqplib.Channel>} The channel to the RabbitMQ server
 */
async function connectToRabbitMQ(): Promise<amqplib.Channel> {
  if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is not set');

  if (!connection) connection = await amqplib.connect(process.env.RABBITMQ_URL!);

  if (!channel) channel = await connection.createChannel();

  await channel.assertExchange(
    EXCHANGE_NAME, // Provide exchange name so exchange is created if it doesn't exist
    'topic', // Provide exchange type as topic
    { durable: true }, // So exchange survives server restarts
  );

  return channel;
}

/**
 * Disconnect from the RabbitMQ server.
 *
 * @returns {Promise<void>}
 */
async function disconnectFromRabbitMQ(): Promise<void> {
  if (channel) await channel.close();

  if (connection) await connection.close();
}

/**
 * Get the RabbitMQ channel.
 *
 * @returns {amqplib.Channel} The channel to the RabbitMQ server
 */
function getChannel(): amqplib.Channel {
  if (!channel) throw new Error('Channel not initialized');

  return channel;
}

/**
 * Publish an event to the RabbitMQ server.
 *
 * @param {EventEnvelope} event  The event to publish
 *
 * @returns {Promise<void>}
 */
async function publishEvent(event: EventEnvelope): Promise<void> {
  if (!channel) throw new Error('Channel not initialized');

  await channel.publish(
    EXCHANGE_NAME,
    event.metadata.eventType,
    Buffer.from(JSON.stringify(event)),
    { persistent: true } // So the event is persisted to the disk if the rabbitmq server crashes
  );
}

export { connectToRabbitMQ,
  disconnectFromRabbitMQ, getChannel, publishEvent };