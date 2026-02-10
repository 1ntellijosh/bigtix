/**
 * Tests for GET orders routes tests
 *
 * @since orders-srv-start--JP
 */
import request from 'supertest';
import { ordersApp } from '../../../src/App';
import { createSignedInUserCookie } from '@bigtix/middleware';
import { Order, NewOrderAttrs } from '../../../src/models/Order';
import { Ticket, SavedTicketDoc, NewTicketAttrs } from '../../../src/models/Ticket';
import { OrderStatusEnum } from '@bigtix/common';
import mongoose from 'mongoose';

const validUserId = new mongoose.Types.ObjectId().toString();

const validTickets = [
  {
    order: null,
    price: 10.00,
    title: 'some title!!!!!',
    version: 1,
  },
  {
    order: null,
    price: 10.00,
    title: 'another title!!!!!',
    version: 1,
  },
  {
    order: null,
    price: 10.00,
    title: 'yet another title!!!!!',
    version: 1,
  },
] as NewTicketAttrs[];
let savedTickets: SavedTicketDoc[] = [];

const validOrders = [
  {
    userId: validUserId,
    expiresAt: new Date(),
    status: OrderStatusEnum.CREATED,
  },
  {
    userId: validUserId,
    expiresAt: new Date(),
    status: OrderStatusEnum.CREATED,
  },
  {
    userId: validUserId,
    expiresAt: new Date(),
    status: OrderStatusEnum.CREATED,
  },
] as NewOrderAttrs[];
let validOrderIds: string[] = [];

/**
 * Saves given order and returns the saved order document
 *
 * @param order 
 *
 * @returns {Promise<SavedOrderDoc>}  The saved order document
 */
const saveOrder = async (order: NewOrderAttrs): Promise<string> => {
  const orderDoc = await Order.build(order).save();

  return orderDoc.id as unknown as string;
};

const saveTickets = async (tickets: NewTicketAttrs[]): Promise<SavedTicketDoc[]> => {
  const ticketDocs = await Ticket.insertMany(tickets);

  return ticketDocs;
};

const addOrderIdToTickets = (orderId: string, tickets: NewTicketAttrs[]): NewTicketAttrs[] => {
  return tickets.map(ticket => ({ ...ticket, order: orderId as unknown as mongoose.Types.ObjectId }));
};

const saveOrders = async (orders: NewOrderAttrs[]): Promise<string[]> => {
  validOrderIds = [];
  for (const order of orders) {
    const orderId = await saveOrder(order);
    validOrderIds.push(orderId);
    const tickets = JSON.parse(JSON.stringify(validTickets));
    const ticketsWithOrderId = addOrderIdToTickets(orderId, tickets);
    await saveTickets(ticketsWithOrderId);
  }

  return validOrderIds;
};

describe('Get orders routes tests', () => {
  afterEach(async () => {
    await Order.deleteMany({});
    await Ticket.deleteMany({});
  });

  it('has a route handler for getting all orders for a user (GET /api/orders)', async () => {
    await request(ordersApp).get('/api/orders').send().expect(401);
  });

  it('get all users orders route returns unauthorized error if user is not authenticated', async () => {
    await saveOrders(validOrders);
    await request(ordersApp)
      .get('/api/orders')
      .send()
      .expect(401);
  });

  it('get all users orders route returns orders for a user', async () => {
    await saveOrders(validOrders);
    const response = await request(ordersApp)
      .get(`/api/orders`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(validOrders.length);
    expect(response.body[0].id).toBe(validOrderIds[0]);
    expect(response.body[0].status).toBe(OrderStatusEnum.CREATED);
    expect(response.body[0].expiresAt).toBe(validOrders[0].expiresAt.toISOString());
    expect(response.body[0].userId).toBe(validUserId);
    expect(response.body[0].tickets.length).toBe(validTickets.length);
    expect(response.body[0].tickets[0].price).toBe(validTickets[0].price);
    expect(response.body[0].tickets[0].title).toBe(validTickets[0].title);
    expect(response.body[0].tickets[0].version).toBe(validTickets[0].version);
    expect(response.body[0].tickets[0].order).toBe(validOrderIds[0]);
  });

  it('has a route handler for getting a single order for a user (GET /api/orders/:id)', async () => {
    await request(ordersApp).get('/api/orders/123').send().expect(400);
  });

  it('get single user order route returns unauthorized error if user is not authenticated', async () => {
    await saveOrders(validOrders);
    await request(ordersApp)
      .get(`/api/orders/${validOrderIds[0]}`)
      .send()
      .expect(401);
  });

  it('get single user order route returns bad request error if order does not belong to the user', async () => {
    await saveOrders(validOrders);
    await request(ordersApp)
      .get(`/api/orders/${validOrderIds[0]}`)
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send()
      .expect(400);
  });

  it('get single user order route returns orders for a user', async () => {
    await saveOrders(validOrders);
    const response = await request(ordersApp)
      .get(`/api/orders/${validOrderIds[0]}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send();

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(validOrderIds[0]);
    expect(response.body.status).toBe(OrderStatusEnum.CREATED);
    expect(response.body.expiresAt).toBe(validOrders[0].expiresAt.toISOString());
    expect(response.body.userId).toBe(validUserId);
    expect(response.body.tickets.length).toBe(validTickets.length);
    expect(response.body.tickets[0].price).toBe(validTickets[0].price);
    expect(response.body.tickets[0].title).toBe(validTickets[0].title);
    expect(response.body.tickets[0].version).toBe(validTickets[0].version);
    expect(response.body.tickets[0].order).toBe(validOrderIds[0]);
  });
});
