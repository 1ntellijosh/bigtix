/**
 * API dictionary for calls to the tickets microservice
 * 
 * @since ticketmaster-api--JP
 */
import { HttpService } from '../HttpService';

export const TicketsAPIs: { [key: string]: (body?: any, config?: Record<string, any>, params?: Record<string, any>) => Promise<Response> } = {
  /**
   * Creates a new ticket
   *
   * @param {object} body  The body of the request
   *   @prop {string} title  The title of the ticket
   *   @prop {number} price  The price of the ticket
   *   @prop {string} description  The description of the ticket
   *   @prop {string} serialNumber  The serial number of the ticket
   *   @prop {string} eventId  The event id of the ticket
   *
   * @returns {Promise<Response>}
   */
  createTicket: function (body: any, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post(`/api/tickets/create`, body, config) as Promise<Response>;
  },

  /**
   * Creates multiple tickets
   *
   * @param {object} body  The body of the request
   *   @prop {string} title  The title of the tickets
   *   @prop {number} price  The price of the tickets
   *   @prop {string} description  The description of the tickets
   *   @prop {array<string>} serialNumbers  The serial numbers of the tickets
   *   @prop {string} eventId  The event id of the tickets
   */
  createTickets: function (body: any, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post(`/api/tickets/createmulti`, body, config) as Promise<Response>;
  },

  /**
   * Searches for events. Tickets microservice uses TicketMaster API to search for events.
   *
   * @param {string} params  The query to search for events
   *
   * @returns {Promise<Response>}
   */
  searchForEvents: function (keyword: string, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.get(`/api/events/search?keyword=${keyword}`, config) as Promise<Response>;
  },

  /**
   * Gets the details of an event
   *
   * @param {object} body  The body of the request
   *   @prop {string} eventId  The id of the event
   *
   * @returns {Promise<Response>}
   */
  getEventDetails: function (eventId: string, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.get(`/api/events/details/${eventId}`, config) as Promise<Response>;
  },

  /**
   * Creates a new event
   *
   * @param {object} body  The body of the request
   *   @prop {string} tmEventId  The ticketmaster event id of the event
   *
   * @returns {Promise<Response>}
   */
  createEvent: function (body: any, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post(`/api/events/create`, body, config) as Promise<Response>;
  },
};
