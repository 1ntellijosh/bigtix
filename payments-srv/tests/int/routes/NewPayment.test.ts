/**
 * Tests for POST payments/new route
 *
 * @since payments-srv-start--JP
 */
import request from 'supertest';
import { paymentsApp } from '../../../src/App';
import { createSignedInUserCookie } from '@bigtix/middleware';
import { Order, NewOrderAttrs } from '../../../src/models/Order';
import { Payment, SavedPaymentDoc, NewPaymentAttrs } from '../../../src/models/Payment';
import { OrderStatusEnum, PaymentStatusEnum } from '@bigtix/common';
import mongoose from 'mongoose';
import { EventPublisher } from '@bigtix/middleware';


const validUserId = new mongoose.Types.ObjectId().toString();

const validOrderId = new mongoose.Types.ObjectId().toString();
const validOrder = {
  id: validOrderId,
  userId: validUserId,
  status: OrderStatusEnum.CREATED,
  price: 10.00,
} as NewOrderAttrs;

const validToken = 'tok_visa';

const validPayment = {
  orderId: validOrderId,
  stripePayIntentId: 'pi_1234567890',
  status: PaymentStatusEnum.PENDING,
} as NewPaymentAttrs;

/**
 * Saves given order and returns the saved order document
 *
 * @param order 
 *
 * @returns {Promise<SavedOrderDoc>}  The saved order document
 */
const saveOrder = async (order: NewOrderAttrs): Promise<string> => {
  const orderDoc = await Order.build(validOrder).save();

  return orderDoc.id as unknown as string;
};

/**
 * Saves given payment and returns the saved payment document
 *
 * @param payment 
 *
 * @returns {Promise<SavedPaymentDoc>}  The saved payment document
 */
const savePayment = async (payment: NewPaymentAttrs): Promise<string> => {
  const paymentDoc = await Payment.build(payment).save();
  return paymentDoc.id as unknown as string;
};

describe('Create payment routes tests', () => {
  afterEach(async () => {
    await Order.deleteMany({});
    await Payment.deleteMany({});
  });

  it('has a route handler for /api/orders/create for post requests', async () => {
    await request(paymentsApp).post('/api/payments/new').send({}).expect(400);
  });

  it('returns a 400 if the orderId is not a valid MongoDB ID', async () => {
    await request(paymentsApp).post('/api/payments/new').send({
      orderId: 'not-a-valid-id',
      amount: 10.00,
      token: validToken,
    }).expect(400);
  });

  it('returns a 400 if the amount is not a valid number', async () => {
    await request(paymentsApp).post('/api/payments/new').send({
      orderId: validOrderId,
      amount: 'not-a-valid-number',
      confirmationTokenId: validToken,
    }).expect(400);
  });

  it('returns a 400 if the amount is less than $10', async () => {
    await request(paymentsApp).post('/api/payments/new').send({
      orderId: validOrderId,
      amount: 9.99,
      confirmationTokenId: validToken,
    }).expect(400);
  });

  it('returns a 400 if the confirmationTokenId is not provided', async () => {
    await request(paymentsApp).post('/api/payments/new').send({
      orderId: validOrderId,
      amount: 10.00,
      confirmationTokenId: '',
    }).expect(400);
  });

  it('returns a 401 if the if user is not authenticated', async () => {
    await request(paymentsApp).post('/api/payments/new').send({
      orderId: validOrderId,
      amount: 10.00,
      confirmationTokenId: validToken,
    }).expect(401);
  });

  it('returns a 404 if the order is not found', async () => {
    await saveOrder(validOrder);
    await request(paymentsApp).post('/api/payments/new')
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        orderId: new mongoose.Types.ObjectId().toString(),
        amount: 10.00,
        confirmationTokenId: validToken,
      }).expect(404);
  });

  it('returns a 401 if the order does not belong to the user', async () => {
    await saveOrder(validOrder);
    await request(paymentsApp).post('/api/payments/new')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        orderId: validOrderId,
        amount: 10.00,
        confirmationTokenId: validToken,
      }).expect(401);
  });

  it('returns a 400 if the order is not in a valid state for creating a payment', async () => {
    const orderWithWrongStatus = JSON.parse(JSON.stringify(validOrder));
    orderWithWrongStatus.status = OrderStatusEnum.EXPIRED;
    await saveOrder(orderWithWrongStatus);
    await request(paymentsApp).post('/api/payments/new')
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        orderId: validOrderId,
        amount: 10.00,
        confirmationTokenId: validToken,
      }).expect(400);
  });

  it('returns a 400 if the payment amount does not match the order amount', async () => {
    await saveOrder(validOrder);
    await request(paymentsApp).post('/api/payments/new')
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        orderId: validOrderId,
        amount: 11.00,
        confirmationTokenId: validToken,
      }).expect(400);
  });

  // it('returns a 400 if the order is not in a valid state for charging', async () => {
  //   const order = await Order.build(validOrder).save();
  //   await request(paymentsApp).post('/api/payments/new').send({
  //     orderId: validOrderId,
  //     amount: 10.00,
  //     token: validToken,
  //   }).expect(400);
  // });

  // it('publishes created order event to the event bus', async () => {
  //   // Spy on the prototype method - the mock class has publishEvent on prototype
  //   const pubSpy = jest.spyOn(EventPublisher.prototype, 'publishEvent').mockResolvedValue(undefined);

  //   const savedTickets = await saveTickets(validTickets);
  //   await request(ordersApp)
  //     .post('/api/orders/create')
  //     .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
  //     .send({
  //       tickets: savedTickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
  //     });

  //   expect(pubSpy).toHaveBeenCalled();
  // });
});
