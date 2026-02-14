/**
 * Main entry point for tickets microservice (tickets-srv) setup and running
 *
 * @since tickets-srv--JP
 */
import { tickApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';
import { connectToRabbitMQ, disconnectFromRabbitMQ } from '@bigtix/middleware';
import { TicketsOrderEventSubscription } from './events/TicketsSubscriptions';
import { subscribeQueues } from '@bigtix/middleware';

const PORT = process.env.PORT || 3000;

const startService = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

  if (!process.env.TICKETMASTER_CONSUMER_KEY) throw new Error('TICKETMASTER_CONSUMER_KEY is not defined');

  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('tickets-srv failed to connect to database: ' + err.message);
  });

  tickApp.listen(PORT, () => {
    console.log(`Tickets service listening on port ${PORT}...`);
  });
};

connectToRabbitMQ().then(async (channel) => {
  await subscribeQueues(channel, [TicketsOrderEventSubscription]);

  await startService();
}).catch((err) => {
  console.error('Error connecting to RabbitMQ: ', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await disconnectFromRabbitMQ();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromRabbitMQ();
  process.exit(0);
});
