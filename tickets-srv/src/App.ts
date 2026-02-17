/**
 * Application setup/wireup for tickets microservice (tickets-srv)
 *
 * @since tickets-srv--JP
 */
import express from "express";
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/CreateTicket';
import { getTicketsRouter } from './routes/GetTickets';
import { updateTicketsRouter } from './routes/UpdateTicket';
import { ErrorHandler as errHandler } from '@bigtix/middleware';
import { ticketMasterAPIRouter } from './routes/TicketMasterAPIRoutes';
import { createEventRouter } from './routes/CreateEvent';

const app = express();
app.set('trust proxy', true); // tell express to trust the proxy (since requests are coming via proxy with NGINX)
app.use(json());
app.use(cookieSession({
  signed: false,
  // Only send cookie over HTTPS in production; allow HTTP in dev so sign-in/sign-up work locally
  secure: process.env.NODE_ENV === 'production'
}));

app.use('/api/tickets', createTicketRouter);
app.use('/api/tickets', getTicketsRouter);
app.use('/api/tickets', updateTicketsRouter);
app.use('/api/events', ticketMasterAPIRouter);
app.use('/api/events', createEventRouter);

app.use(errHandler.prepareErrResp);

export { app as tickApp };

