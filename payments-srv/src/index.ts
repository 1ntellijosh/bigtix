/**
 * Main entry point for payments microservice (payments-srv) setup and running
 *
 * @since payments-srv-start--JP
 */
import { paymentsApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';
import { connectToRabbitMQ, disconnectFromRabbitMQ } from '@bigtix/middleware';
import { PaymentsOrderEventSubscription } from './events/PaymentsSubscriptions';
import { subscribeQueues } from '@bigtix/middleware';

const PORT = process.env.PORT || 3000;

const startService = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not defined');
  if (!process.env.STRIPE_PUBLISHABLE_KEY) throw new Error('STRIPE_PUBLISHABLE_KEY is not defined');
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');

  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('payments-srv failed to connect to database: ' + err.message);
  });

  paymentsApp.listen(PORT, () => {
    console.log(`Payments service listening on port ${PORT}...`);
  });
};

connectToRabbitMQ().then(async (channel) => {
  // Subscribe to RabbitMQ to handle message events between microservices
  await subscribeQueues(channel, [
    PaymentsOrderEventSubscription,
  ]);

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
