/**
 * Ticket update routes for tickets-srv
 *
 * @since tickets-srv--JP
 */
import express, { Request, Response } from "express";
import { body, param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, UnAuthorizedError, BadRequestError } from '@bigtix/common';
import { TicketService } from '../TicketService';

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
 * @throws {BadRequestError}  If ticket is already attached to an order and cannot be edited/updated
 */
router.put('/update/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
    body('title').trim().notEmpty().isLength({ min: 6, max: 125 }).withMessage('Title is required'),
    body('price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { title, price, description } = req.body;
    const { id } = req.params;
    const currentUserId = req.currentUser!.id;
    const ticket = await ticketSvc.getTicketById(id);

    // User must be the owner of the ticket to update it
    if (ticket.userId !== currentUserId) {
      throw new UnAuthorizedError('You are not authorized to update this ticket');
    }

    // If ticket is already attached to an order, it cannot be updated
    if (ticket.orderId) {
      throw new BadRequestError('Ticket is already attached to an order and cannot be updated');
    }

    const updatedTicket = await ticketSvc.updateTicketById(id, { title, price, description });

    res.status(STATUS_CODES.SUCCESS).send(updatedTicket);
  })
);

export { router as updateTicketsRouter };