/**
 * Main entry point for auth-service (auth-srv)
 *
 * @since auth-micro-start--JP
 */
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/CurrentUser'
import { signInRouter } from './routes/SignIn'
import { signOutRouter } from './routes/SignOut'
import { signUpRouter } from './routes/SignUp'
import { ErrorHandler as errHandler } from './middleware/ErrorHandler';
import { DatabaseConnectionError } from './middleware/errors/DatabaseConnectionError';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const app = express();
app.set('trust proxy', true); // tell express to trust the proxy (since requests are coming via proxy with NGINX)
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: true
}));

app.use('/api/users', currentUserRouter);
app.use('/api/users', signInRouter);
app.use('/api/users', signOutRouter);
app.use('/api/users', signUpRouter);

app.use(errHandler.prepareErrResp);

(async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  }

  await mongoose.connect('mongodb://auth-mongo-srv:27017/auth').catch((err) => {
    throw new DatabaseConnectionError('auth-srv failed to connect to database: ' + err.message);
  });

  app.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}...`);
  });
})();
