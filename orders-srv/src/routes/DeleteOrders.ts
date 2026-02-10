/**
 * Order deletion routes for orders-srv
 *
 * @since orders-srv-start--JP
 */
import express, { Request, Response } from "express";
import { param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { OrderService } from '../OrderService';

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
router.delete('/orders/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.currentUser!.id;

    const deleted = await orderSvc.cancelOrderById(currentUserId, id);

    res.status(STATUS_CODES.SUCCESS).send(deleted);
  })
);

export { router as deleteOrderRouter };