/**
 * Ticket creation routes for tickets-srv
 *
 * @since tickets-srv--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { TicketService } from '../TicketService';


const router = express.Router();
const ticketSvc = new TicketService();

/**
 * Creates a new ticket
 *
 * @param {string} title  The title of the ticket
 * @param {number} price  The price of the ticket
 * @param {string} description  The description of the ticket
 * @param {string} serialNumber  The serial number of the ticket
 * @param {string} eventId  The event id of the ticket
 *
 * @throws {BadRequestError}  If ticket is not valid
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/create', [ 
    body('title').trim().notEmpty().isLength({ min: 6, max: 125 }).withMessage('Title is required'),
    body('price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
    body('eventId').trim().notEmpty().isMongoId().withMessage('Event ID is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { title, price, description, serialNumber, eventId } = req.body;
    const userId = req.currentUser!.id;

    const createdTicket = await ticketSvc.createTicket(title, price, userId, description, serialNumber, eventId);

    res.status(STATUS_CODES.CREATED).send(createdTicket);
  })
);

/**
 * Creates multiple tickets
 *
 * @param {string} title  The title of the tickets
 * @param {number} price  The price of the tickets
 * @param {string} description  The description of the tickets
 * @param {array<string>} serialNumbers  The serial numbers of the tickets
 * @param {string} eventId  The event id of the tickets
 *
 * @throws {BadRequestError}  If ticket is not valid
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/createmulti', [ 
  body('title').trim().notEmpty().isLength({ min: 6, max: 125 }).withMessage('Title is required'),
  body('price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('serialNumbers').isArray().withMessage('Serial numbers must be an array').notEmpty().withMessage('Serial numbers are required'),
  body('serialNumbers.*').trim().notEmpty().withMessage('Serial number is required'),
  body('eventId').trim().notEmpty().isMongoId().withMessage('Event ID is required'),
],
api.validateRequest,
api.getCurrentUser,
api.authIsRequired,
api.callAsync(async (req: Request, res: Response) => {
  const { title, price, description, serialNumbers, eventId } = req.body;
  const userId = req.currentUser!.id;

  const createdTickets = await ticketSvc.createTickets(title, price, userId, description, serialNumbers, eventId);

  res.status(STATUS_CODES.CREATED).send(createdTickets);
})
);

export { router as createTicketRouter };