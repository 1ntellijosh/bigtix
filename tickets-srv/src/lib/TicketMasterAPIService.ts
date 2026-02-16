/**
 * Helper class for TicketMaster API service
 *
 * @since ticketmaster-api--JP
 */
import { TICKETMASTER_URLS } from '../consts/TicketMasterAPIConsts';
import { NotFoundError, ServerError } from '@bigtix/common';
import { SearchedEvent, EventDetails, TicketMasterImage } from '@bigtix/common';

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
   * Gets the details of an event using TicketMaster API
   *
   * @param {string} tmEventId  The id of the event
   *
   * @returns {Promise<Response>}  The response from the request
   */
  static async getEventDetails(tmEventId: string): Promise<EventDetails> {
    const url = this.applyParamsToURL(TICKETMASTER_URLS.GET_EVENT_DETAILS, { eventId: tmEventId });

    const response = await fetch(url).catch((error) => {
      throw new ServerError('We\'re having trouble getting event details... Please try again later.');
    });
    
    if (!response || !response.ok) {
      throw new NotFoundError('We\'re having trouble getting event details... Please try again');
    }

    const eventData = await response.json();

    return await this.parseTicketMasterEventDetailsResponse(eventData);
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
        description: '', // Has to be added at client so local date/time is applied
        dateSegments: null, // Has to be added at client so local date/time is applied
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
   * Parses the response from the TicketMaster API get event details
   *
   * @param events 
   * @returns 
   */
  private static async parseTicketMasterEventDetailsResponse(event: any): Promise<EventDetails> {
    const date = this.extractDateFromSearchedEvent(event);

    let image: TicketMasterImage | null = this.extractImageFromSearchedEvent(event, 'TABLET_LANDSCAPE_3_2');
    if (!image) image = this.extractImageFromSearchedEvent(event, 'TABLET_LANDSCAPE_3_2');
    if (!image) image = this.extractImageFromSearchedEvent(event, 'ARTIST_PAGE');
    if (!image) {
      /**
       * If there still isnt an image, we can try to search for event list by event name keyword, since we know it
       * showed in the search results
       */
      const keyword = encodeURIComponent(event.name!);
      const response = await this.searchForEvents(keyword);
      if (response.length > 0) {
        const searchedEvent = response[0];
        image = searchedEvent.image;
      }
    }

    let location = this.extractLocationFromSearchedEvent(event, true);

    const attractions = this.extractAttractionsFromSearchedEvent(event);

    return {
      name: event.name!,
      id: event.id!,
      location,
      date,
      image,
      attractions,
      description: '', // Has to be added at client so local date/time is applied
      dateSegments: null, // Has to be added at client so local date/time is applied
    };
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
  private static extractLocationFromSearchedEvent(
    event: { _embedded?: { venues?: { name?: string; address?: { line1?: string }; city?: { name: string }; state?: { name: string }; country?: { name: string } }[] } },
    includeAddress: boolean = false,
  ): string {
    const venueData = event._embedded?.venues?.[0] || null;

    if (!venueData) return '';

    const name = venueData.name ? `${venueData.name} | ` : '';
    const address = includeAddress && venueData.address?.line1 ? `${venueData.address.line1}, ` : '';
    const city = venueData.city?.name ? `${venueData.city.name}, ` : '';
    const state = venueData.state?.name ? `${venueData.state.name}, ` : '';
    const country = venueData.country?.name ? `${venueData.country.name}` : '';``

    return `${name}${address}${city}${state}${country}`;
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

  /**
   * Extracts attractions from a searched event
   *
   * @param event 
   *
   * @returns {Array<{ name: string; externalLinks: Record<string, string> }>}  The attractions from the event
   */
  private static extractAttractionsFromSearchedEvent(
    event: { _embedded?: { attractions?: { name?: string; externalLinks?: Record<string, Record<string, string>[]>; classifications?: { segment?: { name: string }; genre?: { name: string }; subGenre?: { name: string } }[] }[] } }
  ): { name: string; externalLinks: Record<string, string>, classifications: string[] }[] {
    const attractions: { name: string; externalLinks: Record<string, string>, classifications: string[] }[] = [];

    if (!event._embedded?.attractions || event._embedded.attractions.length === 0 || !event._embedded.attractions[0].name) return attractions;

    for (const attraction of event._embedded.attractions) {
      let name = '';
      let externalLinks: Record<string, string> = {};
      let classifications: string[] = [];
      // if (!attraction.name || !attraction.externalLinks) continue;

      if (attraction.name) name = attraction.name;
      if (attraction.externalLinks) externalLinks = this.extractExternalLinksFromSearchedAttraction(attraction);
      if (attraction.classifications) classifications = this.extractClassificationsFromSearchedAttraction(attraction);

      attractions.push({ name, externalLinks, classifications });
    }

    return attractions;
  }

  /**
   * Extracts external links from a searched attraction in a searched event
   *
   * @param attraction 
   *
   * @returns {Record<string, string>}  The external links from the attraction
   */
  private static extractExternalLinksFromSearchedAttraction(attraction: { externalLinks?: Record<string, Record<string, string>[]> }): Record<string, string> {
    const externalLinks: Record<string, string> = {};
    if (!attraction.externalLinks || Object.keys(attraction.externalLinks).length === 0) return externalLinks;

    for (const [key, value] of Object.entries(attraction.externalLinks)) {
      externalLinks[key] = value[0].url;
    }

    return externalLinks;
  }

  /**
   * Extracts classifications from a searched attraction in a searched event
   *
   * @param attraction 
   * 
   * @returns {string[]}  The classifications from the attraction
   */
  private static extractClassificationsFromSearchedAttraction(attraction: { classifications?: { segment?: { name: string }; genre?: { name: string }; subGenre?: { name: string } }[] }): string[] {
    const classifications: string[] = [];
    if (!attraction.classifications || attraction.classifications.length === 0) return classifications;

    for (const classification of attraction.classifications) {
      if (classification.segment?.name) {
        classifications.push(classification.segment.name);
      }
      if (classification.genre?.name) {
        classifications.push(classification.genre.name);
      }
      if (classification.subGenre?.name) {
        classifications.push(classification.subGenre.name);
      }
    }

    return classifications;
  }
}
