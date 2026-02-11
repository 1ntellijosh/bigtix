/**
 * Main entry point for auth microservice (auth-srv) setup and running
 *
 * @since auth-micro-start--JP
 */
import { authApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';
import { connectToRabbitMQ, disconnectFromRabbitMQ } from '@bigtix/middleware';
import { AuthUserEventSubscription } from './events/AuthSubscriptions';
import { subscribeQueues } from '@bigtix/middleware';

const PORT = process.env.PORT || 3000;

const startService = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('auth-srv failed to connect to database: ' + err.message);
  });

  authApp.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}...`);
  });
};

connectToRabbitMQ().then(async (channel) => {
  // Subscribe to RabbitMQ to handle message events between microservices
  await subscribeQueues(channel, [AuthUserEventSubscription]);

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
