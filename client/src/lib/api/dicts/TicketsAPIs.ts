/**
 * API dictionary for calls to the tickets microservice
 * 
 * @since ticketmaster-api--JP
 */
import { HttpService } from '../HttpService';

export const TicketsAPIs: { [key: string]: (body?: any, config?: Record<string, any>, params?: Record<string, any>) => Promise<Response> } = {
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
};
