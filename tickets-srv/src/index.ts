/**
 * Main entry point for tickets microservice (tickets-srv) setup and running
 *
 * @since tickets-srv--JP
 */
import { tickApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';
import { connectToRabbitMQ, disconnectFromRabbitMQ } from '@bigtix/middleware';
import { EventConsumer, EventConsumerMap } from '@bigtix/middleware';
import { OrderEventConsumers } from './events/EventConsumers';

const PORT = process.env.PORT || 3000;

const startService = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');


  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('tickets-srv failed to connect to database: ' + err.message);
  });

  tickApp.listen(PORT, () => {
    console.log(`Tickets service listening on port ${PORT}...`);
  });
};

connectToRabbitMQ().then(async (channel) => {
  const consumer = new EventConsumer(channel);
  // Register event consumers for order events that tickets service needs to handle
  await consumer.registerEventConsumers(OrderEventConsumers as EventConsumerMap)
    .startConsuming('tickets-srv.order-events');

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
