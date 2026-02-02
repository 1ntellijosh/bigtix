/**
 * Application setup/wireup for auth microservice (auth-srv)
 *
 * @since tests-start--JP
 */
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/CurrentUser'
import { signInRouter } from './routes/SignIn'
import { signOutRouter } from './routes/SignOut'
import { signUpRouter } from './routes/SignUp'
import { ErrorHandler as errHandler } from './middleware/ErrorHandler';

const app = express();
app.set('trust proxy', true); // tell express to trust the proxy (since requests are coming via proxy with NGINX)
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));

app.use('/api/users', currentUserRouter);
app.use('/api/users', signInRouter);
app.use('/api/users', signOutRouter);
app.use('/api/users', signUpRouter);

app.use(errHandler.prepareErrResp);

export { app as authApp };