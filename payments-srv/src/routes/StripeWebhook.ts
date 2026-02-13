/**
 * Stripe webhook route for payments-srv
 *
 * @since payments-srv-start--JP
 */
import express, { Request, Response } from "express";
import { PaymentService } from '../PaymentService';
import { BadRequestError } from '@bigtix/common';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';

const router = express.Router();
const paymentSvc = new PaymentService();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
router.post('/webhooks/stripe',
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const rawBody = req.body;
    const sig = req.headers['stripe-signature'];

    if (!rawBody || !sig) {
      throw new BadRequestError('Raw body and signature are required');
    }

    await paymentSvc.onReceivedStripeWebhook(rawBody as string, sig as string);

    // Always return a 200 OK response to Stripe so they know we received the event and stop retrying
    res.status(STATUS_CODES.SUCCESS).send({ received: true });
  })
);

export { router as stripeWebhookRouter };
