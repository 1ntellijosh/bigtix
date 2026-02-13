/**
 * Tests for DELETE orders/:id route
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
import { EventPublisher } from '@bigtix/middleware';

const validUserId = new mongoose.Types.ObjectId().toString();

const validTickets = [
  {
    order: null,
    price: 10.00,
    title: 'some title!!!!!',
  },
  {
    order: null,
    price: 10.00,
    title: 'another title!!!!!',
  },
  {
    order: null,
    price: 10.00,
    title: 'yet another title!!!!!',
  },
] as NewTicketAttrs[];
let savedTickets: SavedTicketDoc[] = [];

const validOrder = {
  userId: validUserId,
  expiresAt: new Date(),
  status: OrderStatusEnum.CREATED,
  date: new Date(),
} as NewOrderAttrs;
let validOrderId: string;

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
  const ticketDocs = await Ticket.insertMany(tickets.map(ticket => ({ ...ticket, version: 0 })));

  return ticketDocs;
};

const addOrderIdToTickets = (orderId: string, tickets: NewTicketAttrs[]): NewTicketAttrs[] => {
  return tickets.map(ticket => ({ ...ticket, order: orderId as unknown as mongoose.Types.ObjectId }));
};

describe('Delete (cancel) order routes tests', () => {
  afterEach(async () => {
    await Order.deleteMany({});
    await Ticket.deleteMany({});
  });

  it('has a route handler for /api/orders/:id for delete requests', async () => {
    await request(ordersApp).delete('/api/orders/123').expect(400);
  });

  it('Returns unauthorized error if user is not authenticated', async () => {
    const orderId = await saveOrder(validOrder);
    const ticketsWithOrderId = addOrderIdToTickets(orderId, validTickets);
    savedTickets = await saveTickets(ticketsWithOrderId);
    await request(ordersApp)
      .delete(`/api/orders/${orderId}`)
      .send()
      .expect(401);
  });

  it('Returns bad request error if order does not belong to the user', async () => {
    const order = JSON.parse(JSON.stringify(validOrder));
    order.userId = new mongoose.Types.ObjectId().toString();
    const orderId = await saveOrder(order);
    const ticketsWithOrderId = addOrderIdToTickets(orderId, validTickets);
    savedTickets = await saveTickets(ticketsWithOrderId);
    await request(ordersApp)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send()
      .expect(400);
  });

  it('Returns not found error if order is not found', async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const response = await request(ordersApp)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send()
      .expect(404);
  });

  it('Cancels an order by id', async () => {
    const orderId = await saveOrder(validOrder);
    const ticketsWithOrderId = addOrderIdToTickets(orderId, validTickets);
    await saveTickets(ticketsWithOrderId);

    // Just confirm that the tickets are associated with the order before deletion
    savedTickets = await Ticket.find({ order: orderId });
    expect(savedTickets).toHaveLength(3);

    const response = await request(ordersApp)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', createSignedInUserCookie(validOrder.userId))
      .send()
      .expect(200);

    // Confirm order is deleted
    expect(response.body).toBe(true);
    const order = await Order.findById(orderId);
    expect(order?.status).toBe(OrderStatusEnum.CANCELLED);

    // Confirm associated tickets are available by ordering them for another user
    const tickets = await Ticket.find({ order: orderId });
    expect(tickets).toHaveLength(3);

    const createOrderResponse = await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: tickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
      }).expect(201);


    expect(createOrderResponse.body.tickets.length).toBe(3);
    expect(createOrderResponse.body.unavailableTickets.length).toBe(0);
    expect(createOrderResponse.body.ticketsNotFound.length).toBe(0);
  });

  it('publishes cancelled order event to the event bus', async () => {
    // Spy on the prototype method - the mock class has publishEvent on prototype
    const pubSpy = jest.spyOn(EventPublisher.prototype, 'publishEvent').mockResolvedValue(undefined);

    const orderId = await saveOrder(validOrder);
    const ticketsWithOrderId = addOrderIdToTickets(orderId, validTickets);
    await saveTickets(ticketsWithOrderId);

    await request(ordersApp)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', createSignedInUserCookie(validOrder.userId))
      .send()
      .expect(200);

    expect(pubSpy).toHaveBeenCalled();
  });
});
