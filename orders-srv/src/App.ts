/**
 * Application setup/wireup for tickets microservice (tickets-srv)
 *
 * @since tickets-srv--JP
 */
import express from "express";
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { createOrderRouter } from './routes/CreateOrder';
import { updateOrderRouter } from './routes/UpdateOrder';
import { getOrdersRouter } from './routes/GetOrders';
import { deleteOrderRouter } from './routes/DeleteOrders';
import { ErrorHandler as errHandler } from '@bigtix/middleware';

const app = express();
app.set('trust proxy', true); // tell express to trust the proxy (since requests are coming via proxy with NGINX)
app.use(json());
app.use(cookieSession({
  signed: false,
  // Only send cookie over HTTPS in production; allow HTTP in dev so sign-in/sign-up work locally
  secure: process.env.NODE_ENV === 'production'
}));

app.use('/api', createOrderRouter);
app.use('/api', getOrdersRouter);
app.use('/api', updateOrderRouter);
app.use('/api', deleteOrderRouter);

app.use(errHandler.prepareErrResp);

export { app as ordersApp };

