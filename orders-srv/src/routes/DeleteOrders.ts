/**
 * Order deletion routes for orders-srv
 *
 * @since orders-srv-start--JP
 */
import express, { Request, Response } from "express";
import { param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, NotFoundError } from '@bigtix/common';
import { OrderService } from '../OrderService';
import { OrderStatusEnum } from '@bigtix/common';
import { SavedTicketDoc } from '../models/Ticket';

const router = express.Router();
const orderSvc = new OrderService();

/**
 * Cancels an order by id, and all associated tickets
 *
 * @param {string} id  The id of the order to delete
 *
 * @throws {RequestValidationError}  If request validation fails
 * @throws {UnAuthorizedError}  If user is not authenticated, or not the owner of the ticket
 * @throws {NotFoundError}  If ticket is not found
 */
router.delete('/delete/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.currentUser!.id;

    const order = await orderSvc.cancelOrderById(currentUserId, id) as { id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[] };

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.status(STATUS_CODES.SUCCESS).send(true);
  })
);

export { router as deleteOrderRouter };