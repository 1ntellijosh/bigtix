/**
 * Ticket retrieval routes for tickets-srv
 *
 * @since tickets-srv--JP
 */
import express, { Request, Response } from "express";
import { param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { TicketService } from '../TicketService';

const router = express.Router();
const ticketSvc = new TicketService();

/**
 * Retrieves all tickets
 *
 */
router.get('/all', api.callAsync(async (req: Request, res: Response) => {
  const tickets = await ticketSvc.getAllTickets();

  res.status(STATUS_CODES.SUCCESS).send(tickets);
}));

/**
 * Retrieves a single ticket by id
 *
 * @param {string} id  The id of the ticket to retrieve
 *
 * @throws {BadRequestError}  If ticket is not valid
 * @throws {NotFoundError}  If ticket is not found
 */
router.get('/get-ticket/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await ticketSvc.getTicketById(id);

    res.status(STATUS_CODES.SUCCESS).send(ticket);
  })
);

/**
 * Retrieves a single ticket by serial number
 *
 * @param {string} serialNumber  The serial number of the ticket to retrieve
 *
 * @throws {BadRequestError}  If ticket is not valid
 * @throws {NotFoundError}  If ticket is not found
 */
router.get('/serial-number/:serialNumber', [
    param('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { serialNumber } = req.params;
    const ticket = await ticketSvc.getTicketBySerialNumber(serialNumber);

    res.status(STATUS_CODES.SUCCESS).send(ticket);
  })
);

/**
 * Retrieves all tickets by user id
 *
 * @param {string} userId  The userId of the user to retrieve tickets for
 *
 * @throws {BadRequestError}  If userId is not valid
 */
router.get('/user/:userId', [
    param('userId').trim().notEmpty().withMessage('User ID is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const tickets = await ticketSvc.getTicketsByUserId(userId);

    res.status(STATUS_CODES.SUCCESS).send(tickets);
  })
);

/**
 * Retrieves all tickets for a given event id
 *
 * @param {string} eventId  The eventId of the event to retrieve tickets for
 *
 * @throws {RequestValidationError}  If request validation fails
 */
router.get('/for-event/:eventId', [
    param('eventId').trim().notEmpty().isMongoId().withMessage('Event ID is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const tickets = await ticketSvc.getTicketsByEventId(eventId);

    res.status(STATUS_CODES.SUCCESS).send(tickets);
  })
);

/**
 * Retrieves all tickets for a given ticketmaster event id
 *
 * @param {string} tmEventId  The ticketmaster event id of the event to retrieve tickets for
 *
 * @throws {RequestValidationError}  If request validation fails
 */
router.get('/tm-event/:tmEventId', [
    param('tmEventId').trim().notEmpty().withMessage('Ticketmaster event ID is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { tmEventId } = req.params;

    const tickets = await ticketSvc.getTicketsByTmEventId(tmEventId);

    res.status(STATUS_CODES.SUCCESS).send(tickets);
  })
);

export { router as getTicketsRouter };