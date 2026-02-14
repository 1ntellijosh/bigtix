/**
 * Ticket browsing page where a user can browse events and see the tickets for sale
 *
 * @since ticketmaster-api--JP
 */
'use client';
import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { API } from '../../../../../lib/api/dicts/API';
import EventViewer from '../../../../../components/EventViewer';
import { STYLE_CONSTS } from '../../../../../styles/consts';
import { useEffect } from 'react';
import type { EventDetails } from '@bigtix/common';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const onTicketsSelected = async (event: EventDetails) => {
    console.log('event selected for buying tickets: ', event)
  }

  const headerImages = [ 'c1', 'c2', 'c3', 'c4', 'c5' ];
  const [headerImage, setHeaderImage] = useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHeaderImage(headerImages[Math.floor(Math.random() * headerImages.length)] || null);

    const loadEventStates = async () => {
      const eventId = params.eventId;

      if (!eventId || eventId === 'new') {
        router.push('/tickets/search');

        return;
      }

      console.log('loading event:', eventId);

      setSelectedEvent(eventId as unknown as string);
      setLoaded(true);
    }

    loadEventStates();
  }, []);

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      {/* VIEWING THE EVENT DETAILS, AND TICKETS AVAILABLE FOR IT */}
      <Collapse in={loaded && !!selectedEvent} timeout={500} sx={{ minWidth: '100%' }}>
        <Box
          sx={{
            minWidth: '100%',
            backgroundImage: headerImage ? `url(/${headerImage}.jpg)` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: {
              xs: 'none',
              sm: 'none',
              md: 'block',
              lg: 'block',
              xl: 'block',
            },
            height: {
              md: STYLE_CONSTS.EVENT_SEARCH_HEADER_HEIGHT,
              lg: STYLE_CONSTS.EVENT_SEARCH_HEADER_HEIGHT,
              xl: STYLE_CONSTS.EVENT_SEARCH_HEADER_HEIGHT,
            },
            // opacity: (theme) => theme.palette.mode === 'dark' ? 0.35 : 0.15,
            opacity:  0.3,
          }}
        />
      </Collapse>

      {!!selectedEvent && loaded ? (
        <Container
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '100vw',
          }}
        >
          <Box sx={{
            mt: 2,
            width: '100%',
            // Set a max-width that increases at specific breakpoints
            maxWidth: {
              xs: '400px', // max-width on extra-small screens
              md: '900px', // max-width on medium screens
              lg: '1200px', // max-width on large screens
            },
          }}>
            <EventViewer eventId={selectedEvent as string}>
            </EventViewer>
          </Box>
        </Container>
      ) : (
        null
      )}
    </Container>
  );
}
