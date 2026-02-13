/**
 * Event search bar component for the storefront. Calls TicketMaster API to search for events.
 *
 * @since ticketmaster-api--JP
 */
'use client';
import { useState } from 'react';
import SearchBar from './SearchBar';
import { API } from '../lib/api/dicts/API';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ListSearchResults from '../hooks/ListSearchResults';
import EventSearchItem from './EventSearchItem';
import { getDateSegments } from '../lib/DateMethods';
import ListSkeleton from './ListSkeleton';

export default function EventSearch() {
  // Events search results
  const [events, setEvents] = useState<any[] | null>(null);
  // Keyword for the search
  const [keyword, setKeyword] = useState<string>('');
  // Marks if the search is in progress, used to display a loading state
  const [isSearching, setIsSearching] = useState(false);

  const listItemMarginBottom = 1.7;

  /**
   * Processes the events search results
   *
   * @param {SearchedEvent[]} events  The events search results
   */
  const processEventsSearchResults = (events: any) => {
    setIsSearching(false);
    const preparedEvents = [];
    for (const event of events) {
      const segments = getDateSegments(new Date(event.date));
      event.description = `${segments.time} | ${event.location}`;
      event.dateSegments = segments;
      preparedEvents.push(event);
    }

    setEvents(preparedEvents);
  }

  const onSearchFail = (error: APIError) => {
    setIsSearching(false);
    setKeyword('');
  }

  /**
   * Searches for events
   *
   * @param {string} encodedKeyword  The encoded keyword
   *
   * @returns {Promise<SearchedEvent[]>}  The events search results
   */
  const apiSearch = async (encodedKeyword: string): Promise<any[]> => {
    const response = await API.tick!.searchForEvents!(encodedKeyword);

    return response as unknown as Promise<any[]>;
  }

  /**
   * List search results hook
   *
   * @param {Function} apiSearch  The API search function
   * @param {Function} processEventsSearchResults  The function to process the events search results
   *
   * @returns {ListSearchResults}  The list search results hook
   */
  const { submitSearch, searchMutation, errors } = ListSearchResults(
    apiSearch,
    processEventsSearchResults,
    onSearchFail
  );

  const onSearchEntered = (keywords: string) => {
    setEvents(null);

    if (keywords.trim() === '') return;

    setIsSearching(true);
    setKeyword(keywords);
    setTimeout(() => {
      const encoded = encodeURIComponent(keywords);
      submitSearch(encoded);
    }, 1000);
  }

  return (
    <Box>
      <SearchBar placeholder="Search for an event, artist, or venue..." onSearch={onSearchEntered} />

      <Box sx={{ mt: 2 }}>  
        {!errors && events !== null && !events.length ?
          <Typography variant="h5" sx={{ fontFamily: 'oswald' }}>No events found... Please try again with a less specific search.</Typography>
          : null
        }
        {isSearching ?
          <Typography variant="h5" sx={{ fontFamily: 'oswald' }}>Searching for "{keyword}"...</Typography>
          : null
        }
        {!errors && events !== null && events.length ?
            <Typography variant="h5" sx={{ fontFamily: 'oswald' }}>Showing results for "{keyword}"...</Typography>
          : null
        }
      </Box>

      <Box sx={{ mt: 4 }}>
        {isSearching && <ListSkeleton height={119} count={5} marginBottom={listItemMarginBottom} />}

        {!errors && events !== null && events.length ?
          (
            <Box>
              {events.map((event) => (
                <Box key={event.id} sx={{ marginBottom: listItemMarginBottom }}>
                  <EventSearchItem id={event.id} item={event} />
                </Box>
              ))}
            </Box>
          )
          : null
        }

        {errors}
      </Box>
    </Box>
  );
}
