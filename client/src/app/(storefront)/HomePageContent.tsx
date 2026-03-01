/**
 * Holds the client content for the home page
 *
 * @since carousel--JP
 */
'use client'

import { Box } from '@mui/material';
import SearchBarWithNav from '../../components/SearchBarWithNav';
import MainPageCarousel, { type MainPageCarouselEvent } from '../../components/MainPageCarousel';
import { getDateSegments } from '../../lib/DateMethods';
import type { TicketWithEvent } from '../../lib/Types';

export default function HomePageContent({ allTickets }: { allTickets: TicketWithEvent[] | null }) {
  const prepareEventsMapFromTickets = (allTickets: TicketWithEvent[] | null) => {
    const eventsMap = new Map<string, MainPageCarouselEvent>();
    for (const ticket of allTickets || []) {
      if (ticket.event && !eventsMap.has(ticket.event!.title)) {
        const event = ticket.event as unknown as MainPageCarouselEvent;
        const raw = ticket.event.attractions;
        if (typeof raw === 'string') {
          const parsed = JSON.parse(raw);
          event.attractions = parsed;
        } else {
          event.attractions = raw;
        }
        const dateSegments = getDateSegments(new Date(event.date));
        event.dateSegments = dateSegments;
        eventsMap.set(ticket.event!.title, event);
      }
    }

    return eventsMap;
  }

  const eventsMap = prepareEventsMapFromTickets(allTickets);
  const events = Array.from(eventsMap.entries());

  return (
    <Box>
      <Box sx={{ maxWidth: '95%', margin: '0 auto' }}>
        <SearchBarWithNav placeholder="Search for an event" />
      </Box>
      
      <Box sx={{ width: '100%', mt: 7 }}>
        <MainPageCarousel events={events} />
      </Box>
    </Box>
  );
}
