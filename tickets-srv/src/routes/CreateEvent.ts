/**
 * Event creation routes for tickets-srv
 *
 * @since create-tickets--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { TicketService } from '../TicketService';

const router = express.Router();
const ticketSvc = new TicketService();

/**
 * Gets the details of an event from TicketMaster, and saves them to the Event model in the database
 *
 * @param {string} tmEventId  The ticketmaster event id of the event
 *
 * @throws {BadRequestError}  If event is not valid
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/create', [ 
  body('tmEventId').trim().notEmpty().withMessage('ID is required'),
],
api.validateRequest,
api.getCurrentUser,
api.authIsRequired,
api.callAsync(async (req: Request, res: Response) => {
  const { tmEventId } = req.body;

  const createdEvent = await ticketSvc.createEvent(tmEventId);

  res.status(STATUS_CODES.CREATED).send(createdEvent);
}));

export { router as createEventRouter };