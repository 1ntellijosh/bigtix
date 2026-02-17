/**
 * Order update routes for orders-srv
 *
 * @since orders-srv-start--JP
 */
import express, { Request, Response } from "express";
import { body, param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, NotFoundError, UnAuthorizedError } from '@bigtix/common';
import { OrderService } from '../OrderService';
import { OrderStatusEnum } from '@bigtix/common';

const router = express.Router();
const orderSvc = new OrderService();

/**
 * Updates an order status by id
 *
 * @param {string} id  The id of the order to update
 * @param {string} status  The status of the order
 *
 * @throws {RequestValidationError}  If request validation fails
 * @throws {UnAuthorizedError}  If user is not authenticated, or not the owner of the ticket
 * @throws {NotFoundError}  If ticket is not found
 */
router.put('/update/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
    body('status').trim().notEmpty().isIn(Object.values(OrderStatusEnum)).withMessage('Status is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;
    const currentUserId = req.currentUser!.id;
    const order = await orderSvc.getOrderById(id);

    // User must be the owner of the ticket to update it
    if (order.userId !== currentUserId) {
      throw new UnAuthorizedError('You are not authorized to update this order');
    }

    const updatedOrder = await orderSvc.updateOrderStatusById(id, status);

    res.status(STATUS_CODES.SUCCESS).send(updatedOrder);
  })
);

export { router as updateOrderRouter };