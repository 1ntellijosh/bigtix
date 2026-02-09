/**
 * Ticket update routes for tickets-srv
 *
 * @since tickets-srv--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, NotFoundError, UnAuthorizedError } from '@bigtix/common';
import { TicketService } from '../TicketService';
import { EventPublisher } from '@bigtix/middleware';
import { TicketEventFactory } from '../events/TicketEventFactory';
import { EventTypesEnum } from '@bigtix/middleware';

const router = express.Router();
const ticketSvc = new TicketService();

/**
 * Updates a ticket
 *
 * @param {string} id  The id of the ticket to update
 * @param {string} title  The title of the ticket
 * @param {number} price  The price of the ticket
 * @param {string} description  The description of the ticket
 *
 * @throws {RequestValidationError}  If request validation fails
 * @throws {UnAuthorizedError}  If user is not authenticated, or not the owner of the ticket
 * @throws {NotFoundError}  If ticket is not found
 */
router.put('/tickets/update', [ 
    body('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
    body('title').trim().notEmpty().isLength({ min: 6, max: 125 }).withMessage('Title is required'),
    body('price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { id, title, price, description } = req.body;
    const currentUserId = req.currentUser!.id;
    const ticket = await ticketSvc.getTicketById(id);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // User must be the owner of the ticket to update it
    if (ticket.userId !== currentUserId) {
      throw new UnAuthorizedError('You are not authorized to update this ticket');
    }

    const updatedTicket = await ticketSvc.updateTicketById(id, title, price, description);

    const factory = new TicketEventFactory(EventTypesEnum.TICKET_UPDATED);
    const publisher = new EventPublisher(factory);
    await publisher.publishEvent('tickets-srv.ticket-events', EventTypesEnum.TICKET_UPDATED, {
      ticketId: id,
      price,
      description,
      title,
    });

    res.status(STATUS_CODES.SUCCESS).send(updatedTicket);
  })
);

export { router as updateTicketsRouter };