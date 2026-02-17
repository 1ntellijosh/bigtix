/**
 * Order retrieval routes for orders-srv
 *
 * @since orders-srv-start--JP
 */
import express, { Request, Response } from "express";
import { param } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, BadRequestError } from '@bigtix/common';
import { OrderService } from '../OrderService';

const router = express.Router();
const orderSvc = new OrderService();

/**
 * Retrieves all orders for a given user
 *
 * @throws {UnAuthorizedError}  If user is not authenticated
 * @throws {NotFoundError}  If orders are not found
 */
router.get('/all',
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;
    const orders = await orderSvc.getOrdersByUserId(userId);

    res.status(STATUS_CODES.SUCCESS).send(orders);
  })
);

/**
 * Retrieves a single order by id
 *
 * @param {string} id  The id of the order to retrieve
 *
 * @throws {BadRequestError}  If order is not valid
 * @throws {NotFoundError}  If order is not found
 */
router.get('/get-order/:id', [ 
    param('id').trim().notEmpty().isMongoId().withMessage('ID is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser!.id;

    const order = await orderSvc.getOrderById(id);
    
    if (order.userId !== userId) throw new BadRequestError('You are not authorized to view this order');

    res.status(STATUS_CODES.SUCCESS).send(order);
  })
);

export { router as getOrdersRouter };