/**
 * Holds the client content for the home page
 */
'use client'

import { Box } from '@mui/material';
import SearchBarWithNav from './SearchBarWithNav';
import MainPageCarousel, { type MainPageCarouselEvent } from './MainPageCarousel';
import type { SavedTicketDoc } from '../../../tickets-srv/src/models/Ticket';
import type { SavedEventDoc } from '../../../tickets-srv/src/models/Event';
import { getDateSegments } from '../lib/DateMethods';

interface TicketWithEvent extends SavedTicketDoc {
  event: SavedEventDoc;
}

export default function HomeClientContentWrapper({ allTickets }: { allTickets: TicketWithEvent[] | null }) {
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
  const events = Array.from(eventsMap.entries());

  return (
    <Box>
      <SearchBarWithNav placeholder="Search for an event" />
      
      <Box sx={{ width: '100%', mt: 7 }}>
        <MainPageCarousel events={events} />
      </Box>
    </Box>
  );
}
