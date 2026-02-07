/**
 * Tests for POST tickets/create route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { tickApp } from '../../../src/App';
import { createSignedInUserCookie } from '@bigtix/middleware';
import { Ticket, SavedTicketDoc } from '../../../src/models/Ticket';
import { Event } from '../../../src/models/Event';
import mongoose from 'mongoose';

const validTitle = 'some title!!!!!';
const validPrice = 10.00;
const validDescription = 'some description!!!!!';
const validSerialNumber = '1234567890';
const validEvent = {
  title: 'some title!!!!!',
  description: 'some description!!!!!',
  date: new Date(),
  location: 'some location!!!!!',
  organizerId: '1234567890',
};
let validEventId: string;

describe('Sign up route tests', () => {
  beforeEach(async () => {
    const event = await Event.build(validEvent).save();
    validEventId = event.id;
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  it('has a route handler for /api/tickets/create for post requests', async () => {
    const response = await request(tickApp).post('/api/tickets/create').send({});

    expect(response.status).toBe(400);
  });

  it('Returns a 400 for title that is too short', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        email: 'short',
        price: validPrice,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      })
      .expect(400);
  });

  it('Returns a 400 for title that is too long', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: 'some title that is too long, like really long and should be rejected, just like this one, longer than 150 characters, and should be rejected',
        price: validPrice,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      })
      .expect(400);
  });

  it('Returns a 400 for price that is too low', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: validTitle,
        price: 9.99,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      })
      .expect(400);
  });

  it('Returns a 400 for price that is not a decimal number', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: validTitle,
        price: 'not-a-number',
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      })
      .expect(400);
  });

  it('Returns a 400 if serialNumber is not provided', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription,
        serialNumber: '',
        eventId: validEventId,
      })
      .expect(400);
  });

  it('Returns a 400 if eventId is not a valid MongoDB ID', async () => {
    return request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: 'not-a-valid-id',
      })
      .expect(400);
  });

  it('can not be accessed if the user is not signed in', async () => {
    await request(tickApp)
      .post('/api/tickets/create')
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      })
      .expect(401);
  });

  it('returns array with each ticket\'s id, title and price after successful creation', async () => {
    let tickets: SavedTicketDoc[] = await Ticket.find({});
    expect(tickets.length).toBe(0);

    const response = await request(tickApp)
      .post('/api/tickets/create')
      .set('Cookie', createSignedInUserCookie(new mongoose.Types.ObjectId().toString()))
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription,
        serialNumber: validSerialNumber,
        eventId: validEventId,
      }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toBe(1);
    expect(tickets[0].id).toBe(response.body.id);
    expect(tickets[0].title).toBe(validTitle);
    expect(tickets[0].price).toBe(validPrice);
    expect(tickets[0].description).toBe(validDescription);
    expect(tickets[0].serialNumber).toBe(validSerialNumber);
    expect(tickets[0].eventId).toBe(validEventId);
  });
});
