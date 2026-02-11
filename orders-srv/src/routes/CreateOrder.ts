/**
 * Order creation routes for orders-srv
 *
 * @since orders-srv-start--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { OrderService } from '../OrderService';

const router = express.Router();
const orderSvc = new OrderService();

/**
 * Creates a new order
 *
 * @param {array<Object>} tickets  The tickets to order, each with:
 *   @prop {string} ticketId  The id of the ticket to order
 *   @prop {number} price  The price of the ticket
 *
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/orders/create', [ 
    body('tickets').isArray().withMessage('Tickets must be an array').notEmpty().withMessage('Tickets are required'),
    body('tickets.*.id').trim().notEmpty().isMongoId().withMessage('Ticket ID is required'),
    body('tickets.*.price').isFloat({ min: 10 }).withMessage('Price must be a valid number and at least $10'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { tickets } = req.body;
    const userId = req.currentUser!.id;

    const result = await orderSvc.createOrderAndReserveTickets(userId, tickets);

    res.status(STATUS_CODES.CREATED).send(result);
  })
);

export { router as createOrderRouter };