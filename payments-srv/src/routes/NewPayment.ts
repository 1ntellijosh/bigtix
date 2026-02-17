/**
 * Create payment routes for payments-srv
 *
 * @since payments-srv-start--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { PaymentService } from '../PaymentService';

const router = express.Router();
const paymentSvc = new PaymentService();

/**
 * Creates a new payment for an order
 *
 * @param {string} orderId  The id of the order to charge
 * @param {number} amount  The amount to charge
 * @param {string} confirmationTokenId  The Stripe confirmation token ID
 *
 * @throws {BadRequestError}  If order is not found
 * @throws {UnAuthorizedError}  If user is not authenticated
 */
router.post('/new', [ 
    body('orderId').trim().notEmpty().isMongoId().withMessage('Order ID is required'),
    body('amount').isFloat({ min: 10 }).withMessage('Amount must be a valid number and at least $10'),
    body('confirmationTokenId').trim().notEmpty().withMessage('Confirmation Token ID is required'),
  ],
  api.validateRequest,
  api.getCurrentUser,
  api.authIsRequired,
  api.callAsync(async (req: Request, res: Response) => {
    const { orderId, amount, confirmationTokenId } = req.body;
    const userId = req.currentUser!.id;

    const payment = await paymentSvc.createPaymentForOrder(userId, confirmationTokenId, orderId, amount);

    res.status(STATUS_CODES.CREATED).send(payment);
  })
);

export { router as createPaymentRouter };