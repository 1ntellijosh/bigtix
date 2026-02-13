/**
 * Tests for TicketMaster API routes
 *
 * @since ticketmaster-api--JP
 */
import request from 'supertest';
import { tickApp } from '../../../src/App';

describe('TicketMaster API routes tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ _embedded: { events: [] } }),
    }) as jest.Mock;
  });

  it('should return a 200 status code', async () => {
    const response = await request(tickApp).get('/api/events/search/test');
    expect(response.status).toBe(200);
  });

  // it('should return a 400 status code if the query is not provided', async () => {
  //   const response = await request(tickApp).get('/api/events/search');
  //   expect(response.status).toBe(400);
  // });

  // it('should return a 400 status code if the query is not a string', async () => {
  //   const response = await request(tickApp).get('/api/events/search/123');
  //   expect(response.status).toBe(400);
  // });
});