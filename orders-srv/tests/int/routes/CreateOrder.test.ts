/**
 * Tests for POST orders/create route
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
  userId: new mongoose.Types.ObjectId().toString(),
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
  const orderDoc = await Order.build(validOrder).save();

  return orderDoc.id as unknown as string;
};

const saveTickets = async (tickets: NewTicketAttrs[]): Promise<SavedTicketDoc[]> => {
  const ticketDocs = await Ticket.insertMany(tickets.map(ticket => ({ ...ticket, version: 0 })));

  return ticketDocs;
};

const addOrderIdToTickets = (orderId: string, tickets: NewTicketAttrs[]): NewTicketAttrs[] => {
  return tickets.map(ticket => ({ ...ticket, order: orderId as unknown as mongoose.Types.ObjectId }));
};

describe('Create order routes tests', () => {
  afterEach(async () => {
    await Order.deleteMany({});
    await Ticket.deleteMany({});
  });

  it('has a route handler for /api/orders/create for post requests', async () => {
    await request(ordersApp).post('/api/orders/create').send({}).expect(400);
  });

  it('Returns an error if requested tickets are not found', async () => {
    await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            order: null,
            price: 10.00,
            title: 'some title!!!!!',
            version: 0,
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            order: null,
            price: 10.00,
            title: 'another title!!!!!',
            version: 0,
          },
        ],
      }).expect(400);
  });

  it('Returns an error if all requested tickets are already reserved', async () => {
    const orderId = await saveOrder(validOrder);
    const ticketsWithOrderId = addOrderIdToTickets(orderId, validTickets);
    savedTickets = await saveTickets(ticketsWithOrderId);

    await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: savedTickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
      })
      .expect(400);
  });

  it('Reserves requested tickets', async () => {
    const savedTickets = await saveTickets(validTickets);
    const response = await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: savedTickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
      });

    expect(response.status).toBe(201);
    expect(response.body.tickets.length).toBe(3);
    expect(response.body.unavailableTickets.length).toBe(0);
    expect(response.body.ticketsNotFound.length).toBe(0);
  });

  it('Reserves only available requested tickets', async () => {
    const orderId = await saveOrder(validOrder);
    const tickets = JSON.parse(JSON.stringify(validTickets));
    tickets[0].order = orderId as unknown as mongoose.Types.ObjectId;
    const savedTickets = await saveTickets(tickets);
    savedTickets.push({
      id: new mongoose.Types.ObjectId().toString(),
      order: null,
      price: 10.00,
      title: 'some title!!!!!',
      version: 0,
    } as SavedTicketDoc);
    const response = await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: savedTickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
      });

    expect(response.status).toBe(201);
    expect(response.body.tickets.length).toBe(2);
    expect(response.body.unavailableTickets.length).toBe(1);
    expect(response.body.ticketsNotFound.length).toBe(1);
  });

  it('publishes created order event to the event bus', async () => {
    // Spy on the prototype method - the mock class has publishEvent on prototype
    const pubSpy = jest.spyOn(EventPublisher.prototype, 'publishEvent').mockResolvedValue(undefined);

    const savedTickets = await saveTickets(validTickets);
    await request(ordersApp)
      .post('/api/orders/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        tickets: savedTickets.map(ticket => ({ id: ticket.id, price: ticket.price })),
      });

    expect(pubSpy).toHaveBeenCalled();
  });
});
