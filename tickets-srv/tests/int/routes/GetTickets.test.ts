/**
 * Tests for GET tickets routes
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { tickApp } from '../../../src/App';
import { Ticket, SavedTicketDoc, NewTicketAttrs } from '../../../src/models/Ticket';
import { Event } from '../../../src/models/Event';
import mongoose from 'mongoose';

const validTitle = 'some title!!!!!';
const validPrice = 10.00;
const validDescription = 'some description!!!!!';
const validUserId = '1234567890';
const validEvent = {
  title: 'some title!!!!!',
  description: 'some description!!!!!',
  date: new Date(),
  location: 'some location!!!!!',
};
let validEventId: string;
const tickets: NewTicketAttrs[] = [
  {
    title: validTitle,
    price: validPrice,
    userId: validUserId,
    description: validDescription,
    serialNumber: '1234567890',
    eventId: '',
  },
  {
    title: validTitle,
    price: validPrice,
    userId: validUserId,
    description: validDescription,
    serialNumber: '1234567891',
    eventId: '',
  },
  {
    title: validTitle,
    price: validPrice,
    userId: validUserId,
    description: validDescription,
    serialNumber: '1234567892',
    eventId: '',
  },
];
let savedTickets: SavedTicketDoc[] = [];

describe('Get tickets routes tests', () => {
  beforeEach(async () => {
    savedTickets = [];
    const event = await Event.build(validEvent).save();
    validEventId = event._id.toString();
    
    for (const ticket of tickets) {
      ticket.eventId = validEventId;
      const savedTicket = await Ticket.build(ticket).save();
      savedTicket.id = savedTicket._id.toString();
      savedTickets.push(savedTicket);
    }
  });

  afterEach(async () => {
    await Event.deleteMany({});
    await Ticket.deleteMany({});
  });

  it('returns all tickets', async () => {
    const response = await request(tickApp).get('/api/tickets');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(savedTickets.length);
    expect(response.body[0].title).toBe(savedTickets[0].title);
    expect(response.body[0].price).toBe(savedTickets[0].price);
    expect(response.body[0].description).toBe(savedTickets[0].description);
  });

  it('returns a 400 if the ticket id is not a valid MongoDB ID', async () => {
    const response = await request(tickApp).get('/api/tickets/not-a-valid-id');

    expect(response.status).toBe(400);
  });

  it('returns a 404 if the ticket is not found by id', async () => {
    const invalidId = new mongoose.Types.ObjectId().toString();
    const response = await request(tickApp).get(`/api/tickets/${invalidId}`);

    expect(response.status).toBe(404);
  });

  it('returns the ticket if it is found by id', async () => {
    const response = await request(tickApp).get(`/api/tickets/${savedTickets[0].id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(savedTickets[0].id);
    expect(response.body.title).toBe(savedTickets[0].title);
    expect(response.body.price).toBe(savedTickets[0].price);
    expect(response.body.description).toBe(savedTickets[0].description);
    expect(response.body.serialNumber).toBe(savedTickets[0].serialNumber);
    expect(response.body.eventId).toBe(savedTickets[0].eventId);
  });

  it('returns a 404 if the ticket is not found by serial number', async () => {
    const response = await request(tickApp).get('/api/tickets/serial-number/1234567893');

    expect(response.status).toBe(404);
  });

  it('returns the ticket if it is found by serial number', async () => {
    const response = await request(tickApp).get(`/api/tickets/serial-number/${savedTickets[0].serialNumber}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(savedTickets[0].id);
    expect(response.body.title).toBe(savedTickets[0].title);
    expect(response.body.price).toBe(savedTickets[0].price);
    expect(response.body.description).toBe(savedTickets[0].description);
    expect(response.body.serialNumber).toBe(savedTickets[0].serialNumber);
    expect(response.body.eventId).toBe(savedTickets[0].eventId);
  });

  it('returns the ticket if it is found by event id', async () => {
    const response = await request(tickApp).get(`/api/tickets/event/${validEventId}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(savedTickets.length);
    expect(response.body[0].title).toBe(savedTickets[0].title);
    expect(response.body[0].price).toBe(savedTickets[0].price);
    expect(response.body[0].description).toBe(savedTickets[0].description);
    expect(response.body[0].serialNumber).toBe(savedTickets[0].serialNumber);
    expect(response.body[0].eventId).toBe(savedTickets[0].eventId);
  });

  it('returns all tickets for a given user', async () => {
    const response = await request(tickApp).get(`/api/tickets/user/${validUserId}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(savedTickets.length);
    expect(response.body[0].title).toBe(savedTickets[0].title);
    expect(response.body[0].price).toBe(savedTickets[0].price);
    expect(response.body[0].description).toBe(savedTickets[0].description);
    expect(response.body[0].serialNumber).toBe(savedTickets[0].serialNumber);
    expect(response.body[0].eventId).toBe(savedTickets[0].eventId);
  });
});