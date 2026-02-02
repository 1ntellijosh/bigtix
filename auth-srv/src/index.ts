/**
 * Main entry point for auth microservice (auth-srv) setup and running
 *
 * @since auth-micro-start--JP
 */
import { authApp } from './App';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from './middleware/errors/DatabaseConnectionError';

const PORT = process.env.PORT || 3000;

(async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  }

  await mongoose.connect('mongodb://auth-mongo-srv:27017/auth').catch((err) => {
    throw new DatabaseConnectionError('auth-srv failed to connect to database: ' + err.message);
  });

  authApp.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}...`);
  });
})();
