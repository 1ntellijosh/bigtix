/**
 * List of URL constants for TicketMaster API
 *
 * @since ticketmaster-api--JP
 */
export const TICKETMASTER_URLS = {
  SEARCH_EVENTS: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey={API_KEY}&keyword={keyword}',
  GET_EVENT_DETAILS: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey={API_KEY}&eventId={eventId}',
  GET_VENUE_DETAILS: 'https://app.ticketmaster.com/discovery/v2/venues.json?apikey={API_KEY}&venueId={venueId}',
  GET_ATTRACTION_DETAILS: 'https://app.ticketmaster.com/discovery/v2/attractions.json?apikey={API_KEY}&attractionId={attractionId}',
}
