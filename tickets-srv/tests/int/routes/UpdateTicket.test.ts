/**
 * Tests for PUT tickets/update route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { tickApp } from '../../../src/App';
import { createSignedInUserCookie } from '@bigtix/middleware';
import { Ticket, SavedTicketDoc, NewTicketAttrs } from '../../../src/models/Ticket';
import { Event } from '../../../src/models/Event';
import mongoose from 'mongoose';
import { EventPublisher } from '@bigtix/middleware';

const validTitle = 'some title!!!!!';
const validPrice = 10.00;
const validDescription = 'some description!!!!!';
const validUserId = new mongoose.Types.ObjectId().toString();
const validEvent = {
  title: 'some title!!!!!',
  description: 'some description!!!!!',
  date: new Date(),
  location: 'some location!!!!!',
  organizerId: '1234567890',
};
let validEventId: string;
let savedTicket: SavedTicketDoc;
const ticket: NewTicketAttrs = {
  title: validTitle,
  price: validPrice,
  userId: validUserId,
  description: validDescription,
  serialNumber: '1234567890',
  eventId: '',
};

describe('Update ticket routes tests', () => {
  beforeEach(async () => {
    const event = await Event.build(validEvent).save();
    validEventId = event._id.toString();

    ticket.eventId = validEventId;
    savedTicket = await Ticket.build(ticket).save();
    savedTicket.id = savedTicket._id.toString();
  });

  afterEach(async () => {
    await Event.deleteMany({});
    await Ticket.deleteMany({});
  });

  it('returns a 400 if the ticket id is not a valid MongoDB ID', async () => {
    await request(tickApp).put('/api/tickets/not-a-valid-id').send({
      title: validTitle,
      price: validPrice,
      description: validDescription
    }).expect(400);
  });

  it('can not be accessed if the user is not signed in', async () => {
    await request(tickApp).put(`/api/tickets/${savedTicket.id}`).send({
      title: validTitle,
      price: validPrice,
      description: validDescription
    }).expect(401);
  });

  it('returns a 404 if the ticket is not found by id', async () => {
    const invalidId = new mongoose.Types.ObjectId().toString();
    await request(tickApp)
      .put(`/api/tickets/${invalidId}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription
      }).expect(404);
  });

  it('returns a 401 if the user is not the owner of the ticket', async () => {
    await request(tickApp)
      .put(`/api/tickets/${savedTicket.id}`)
      .set('Cookie', createSignedInUserCookie('not-the-owner-id'))
      .send({
        title: validTitle,
        price: validPrice,
        description: validDescription
      }).expect(401);
  });

  it('returns the updated ticket if it is found by id', async () => {
    const response = await request(tickApp)
      .put(`/api/tickets/${savedTicket.id}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        id: savedTicket.id,
        title: validTitle,
        price: validPrice,
        description: validDescription,
      });
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(savedTicket.id);
    expect(response.body.title).toBe(validTitle);
    expect(response.body.price).toBe(validPrice);
    expect(response.body.description).toBe(validDescription);
  });

  it('publishes updated ticket event to the event bus', async () => {
    const pubSpy = jest.spyOn(EventPublisher.prototype, 'publishEvent').mockResolvedValue(undefined);
    await request(tickApp)
      .put(`/api/tickets/${savedTicket.id}`)
      .set('Cookie', createSignedInUserCookie(validUserId))
      .send({
        id: savedTicket.id,
        title: validTitle,
        price: validPrice,
        description: validDescription,
      });
    expect(pubSpy).toHaveBeenCalled();
  });
});