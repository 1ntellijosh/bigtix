/**
 * Main entry point for orders microservice (orders-srv) setup and running
 *
 * @since orders-srv-start--JP
 */
import { ordersApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';
import { connectToRabbitMQ, disconnectFromRabbitMQ } from '@bigtix/middleware';
import { EventConsumer, EventConsumerMap } from '@bigtix/middleware';
import { TicketEventHandlers, OrderEventHandlers } from './events/EventConsumers';

const PORT = process.env.PORT || 3000;

const startService = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('tickets-srv failed to connect to database: ' + err.message);
  });

  ordersApp.listen(PORT, () => {
    console.log(`Orders service listening on port ${PORT}...`);
  });
};

connectToRabbitMQ().then(async (channel) => {
  const ticketConsumer = new EventConsumer(channel);
  // Register event consumers for ticket events that orders service needs to handle
  await ticketConsumer.registerEventConsumers(TicketEventHandlers as EventConsumerMap)
    .startConsuming('orders-srv.ticket-events');
  // Register event consumers for order events that orders service needs to handle (delayed messages)
  const orderConsumer = new EventConsumer(channel);
  await orderConsumer.registerEventConsumers(OrderEventHandlers as EventConsumerMap)
    .startConsuming('orders-srv.order-events');

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
