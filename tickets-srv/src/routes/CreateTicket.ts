/**
 * Ticket creation routes for tickets-srv
 *
 * @since tickets-srv--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, BadRequestError } from '@bigtix/common';
import { TicketService } from '../TicketService';
import { EventPublisher } from '@bigtix/middleware';
import { TicketEventFactory } from '../events/TicketEventFactory';
import { EventTypesEnum } from '@bigtix/middleware';


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
router.post('/tickets/create', [ 
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

    const factory = new TicketEventFactory(EventTypesEnum.TICKET_CREATED);
    const publisher = new EventPublisher(factory);
    await publisher.publishEvent('tickets-srv.ticket-events', EventTypesEnum.TICKET_CREATED, {
      ticketId: createdTicket.id,
      eventId,
      userId,
      price,
      description,
      serialNumber,
      title,
    });

    res.status(STATUS_CODES.CREATED).send(createdTicket);
  })
);

export { router as createTicketRouter };