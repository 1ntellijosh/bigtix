/**
 * Application setup/wireup for payments microservice (payments-srv)
 *
 * @since payments-srv-start--JP
 */
import express from "express";
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { createPaymentRouter }  from './routes/NewPayment';
import { stripeWebhookRouter } from './routes/StripeWebhook';
import { ErrorHandler as errHandler } from '@bigtix/middleware';

const app = express();
app.set('trust proxy', true); // tell express to trust the proxy (since requests are coming via proxy with NGINX)
app.use(json());
app.use(cookieSession({
  signed: false,
  // Only send cookie over HTTPS in production; allow HTTP in dev so sign-in/sign-up work locally
  secure: process.env.NODE_ENV === 'production'
}));

app.use('/api', createPaymentRouter);
app.use('/api', stripeWebhookRouter);

app.use(errHandler.prepareErrResp);

export { app as paymentsApp };

