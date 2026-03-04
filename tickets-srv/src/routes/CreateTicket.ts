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
 * @param {array<Object>} tickets  The tickets to create, each with:
 *   @prop {string} tickets.title  The title of the ticket
 *   @prop {number} tickets.price  The price of the ticket
 *   @prop {string} tickets.description  The description of the ticket
 *   @prop {string} tickets.serialNumber  The serial number of the ticket
 *   @prop {string} tickets.eventId  The event id of the ticket
 *
 * @throws {BadRequestError}  If ticket is not valid
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/createmulti', [ 
  body('tickets').isArray().withMessage('Tickets must be an array').notEmpty().withMessage('Tickets are required'),
  body('tickets.*.title').trim().notEmpty().isLength({ min: 6, max: 125 }).withMessage('Title is required'),
  body('tickets.*.price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
  body('tickets.*.description').trim().notEmpty().withMessage('Description is required'),
  body('tickets.*.serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('tickets.*.eventId').trim().notEmpty().isMongoId().withMessage('Event ID is required'),
],
api.validateRequest,
api.getCurrentUser,
api.authIsRequired,
api.callAsync(async (req: Request, res: Response) => {
  const { tickets } = req.body;
  const userId = req.currentUser!.id;

  await ticketSvc.createTickets(userId, tickets);

  res.status(STATUS_CODES.CREATED).send({ success: true });
})
);

export { router as createTicketRouter };