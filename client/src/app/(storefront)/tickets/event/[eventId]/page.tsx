/**
 * Ticket browsing page where a user can browse events and see the tickets for sale
 *
 * @since ticketmaster-api--JP
 */
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EventPageContent from './EventPageContent';
import type { SavedTicketDoc } from '../../../../../../../tickets-srv/src/models/Ticket';
import { headers } from 'next/headers';
import { API } from '../../../../../lib/api/dicts/API';
import { getDateSegments } from '../../../../../lib/DateMethods';
import type { EventDetails } from '../../../../../../../packages/common/src/contracts';

export default async function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const { eventId } = await params;

  let ctxHeaders = await headers();
  let cookie = ctxHeaders.get('cookie') ?? '';
  let host = ctxHeaders.get('host') ?? '';

  let event: EventDetails | null = null;
  try { 
    ctxHeaders = await headers();
    cookie = ctxHeaders.get('cookie') ?? '';
    host = ctxHeaders.get('host') ?? '';
    const resp = await API.tick!.getEventDetails!(eventId, {
      headers: { Cookie: cookie, Host: host },
    });
    event = (resp as unknown as EventDetails) ?? null;
  } catch (error) {
    event = null;
  }

  let availableTickets: SavedTicketDoc[] | null = null;
  if (event) {
    try {
      ctxHeaders = await headers();
      cookie = ctxHeaders.get('cookie') ?? '';
      host = ctxHeaders.get('host') ?? '';
      const resp = await API.tick!.getTicketsByTmEventId!(event.id, {
        headers: { Cookie: cookie, Host: host },
      });
      availableTickets = (resp as unknown as SavedTicketDoc[]) ?? null;
    } catch (error) {
      availableTickets = null;
    }
  }


  /**
   * Add date segments to the event details
   *
   * @param {EventDetails} event - The event details
   */
  const addDateSegmentsToEvent = (event: EventDetails) => {
    if (event.date == null) {
      event.description = event.location ?? '';
      event.dateSegments = { month: '', day: '', weekday: '' };
      return;
    }
    const dateSegments = getDateSegments(new Date(event.date));
    event.description = `${dateSegments.time} | ${event.location}`;
    event.dateSegments = { month: dateSegments.month, day: dateSegments.day.toString(), weekday: dateSegments.weekday };
  };

  /**
   * Fix empty attractions event
   *
   * @param {EventDetails} event - The event details
   */
  const fixEmptyAttractionsEvent = (event: EventDetails) => {
    if (!event.attractions?.length) {
      const dateSegments = event.dateSegments;
      const year = event.date ? new Date(event.date).getFullYear() : '';
      event.attractions = event.attractions ?? [];
      event.attractions.push({
        name: dateSegments ? `${dateSegments.month} ${dateSegments.day} ${year}` : 'Event',
        externalLinks: {},
        classifications: [],
      });
    }
  };

  if (event) {
    addDateSegmentsToEvent(event);
    fixEmptyAttractionsEvent(event);
  }

  if (!event) {
    return (
      <Container sx={{ minWidth: '100%', height: '100%', py: 4 }} disableGutters>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Event not found
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <EventPageContent event={event as unknown as React.ComponentProps<typeof EventPageContent>['event']} availableTickets={availableTickets} />
    </Container>
  );
}
