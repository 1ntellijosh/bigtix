/**
 * Main entry point for tickets microservice (tickets-srv) setup and running
 *
 * @since tickets-srv--JP
 */
import { tickApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bigtix/common';

const PORT = process.env.PORT || 3000;

(async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI).catch((err) => {
    throw new DatabaseConnectionError('tickets-srv failed to connect to database: ' + err.message);
  });

  tickApp.listen(PORT, () => {
    console.log(`Tickets service listening on port ${PORT}...`);
  });
})();
