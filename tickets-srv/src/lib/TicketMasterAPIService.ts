/**
 * Helper class for TicketMaster API service
 *
 * @since ticketmaster-api--JP
 */
import { TICKETMASTER_URLS } from '../consts/TicketMasterAPIConsts';
import { NotFoundError, ServerError } from '@bigtix/common';

interface TicketMasterImage {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
}

interface SearchedEvent {
  name: string;
  id: string;
  location: string;
  date: Date | null;
  image: TicketMasterImage | null;
}

export class TicketMasterAPIService {
  /**
   * Searches for events using TicketMaster API
   *
   * @param {string} query  The query to search for events
   *
   * @returns {Promise<any>}  The events from the TicketMaster API
   */
  static async searchForEvents(keyword: string): Promise<SearchedEvent[]> {
    const url = this.applyParamsToURL(TICKETMASTER_URLS.SEARCH_EVENTS, { keyword });

    const response = await fetch(url).catch((error) => {
      throw new ServerError('We\'re having trouble getting events... Please try again later.');
    });
    
    if (!response || !response.ok) {
      throw new NotFoundError('We\'re having trouble finding events... Please try again');
    }
  
    const data = await response.json();

    const events = data._embedded?.events || [];

    return this.parseTicketMasterEventsSearchResponse(events);
  }

  /**
   * Applies parameters to a URL
   *
   * @param {string} url  The URL to apply parameters to
   * @param {Record<string, string>} params  The parameters to apply to the URL
   *
   * @returns {string}  The URL with parameters applied
   */
  private static applyParamsToURL(url: string, params: Record<string, string>): string {
    url = url.replace('{API_KEY}', process.env.TICKETMASTER_CONSUMER_KEY!)

    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }

    return url;
  }

  /**
   * Parses the response from the TicketMaster API search for events
   *
   * @param events 
   * @returns 
   */
  private static parseTicketMasterEventsSearchResponse(events: {
    type: string;
    name: string;
    id?: string;
    images?: TicketMasterImage[];
    dates?: { start?: { dateTime?: string } };
    _embedded?: {
      venues?: {
        name?: string;
        city?: { name: string };
        state?: { name: string };
        country?: { name: string };
      }[];
    };
  }[]): SearchedEvent[] {
    const formattedEvents: SearchedEvent[] = [];
    for (const event of events) {
      if (!this.canIncludeAsSearchedEvent(event)) continue;

      const date = this.extractDateFromSearchedEvent(event);

      if (!date) continue;

      let image: TicketMasterImage | null = this.extractImageFromSearchedEvent(event, 'ARTIST_PAGE');
      if (!image) image = this.extractImageFromSearchedEvent(event, '640x427');

      let location = this.extractLocationFromSearchedEvent(event);

      const formattedEvent: SearchedEvent = {
        name: event.name!,
        id: event.id!,
        location,
        date,
        image,
      };

      formattedEvents.push(formattedEvent);
    }

    return formattedEvents;
  }

  /**
   * Determines if an event should be included in the search results
   *
   * @param event 
   *
   * @returns {boolean}  True if the event should be included in the search results, false otherwise
   */
  private static canIncludeAsSearchedEvent(event: unknown): boolean {
    if (!event || typeof event !== 'object' || !('id' in event)) return false;

    const e = event as Record<string, unknown>;

    return e.type === 'event'
      && typeof e.name === 'string'
      && !e.name.includes('Used for testing member exclusive');
  }


  /**
   * Extracts an image from a searched event
   *
   * @param event 
   * @param imageType 
   * @returns 
   */
  private static extractImageFromSearchedEvent(event: { images?: TicketMasterImage[] }, imageType: string): TicketMasterImage | null {
    if (!('images' in event) || !event.images || event.images.length === 0) return null;

    let image: TicketMasterImage | null = null;  
    for (let i = 0; i < event.images.length; i++) {
      if (event.images[i].url.includes(imageType)) {
        image = event.images[i];
        break;
      }
    }

    return image;
  }

  /**
   * Extracts a location from a searched event
   *
   * @param event 
   * @returns 
   */
  private static extractLocationFromSearchedEvent(event: { _embedded?: { venues?: { name?: string; city?: { name: string }; state?: { name: string }; country?: { name: string } }[] } }): string {
    const venueData = event._embedded?.venues?.[0] || null;

    if (!venueData) return '';

    const name = venueData.name ? `${venueData.name} | ` : '';
    const city = venueData.city?.name ? `${venueData.city.name}, ` : '';
    const state = venueData.state?.name ? `${venueData.state.name}, ` : '';
    const country = venueData.country?.name ? `${venueData.country.name}` : '';``

    return `${name}${city}${state}${country}`;
  }

  /**
   * Extracts a date from a searched event
   *
   * @param event 
   * @returns 
   */
  private static extractDateFromSearchedEvent(event: { dates?: { start?: { dateTime?: string } } }): Date | null {
    const dateRaw = event.dates?.start?.dateTime;

    return dateRaw ? new Date(dateRaw) : null;
  }
}


