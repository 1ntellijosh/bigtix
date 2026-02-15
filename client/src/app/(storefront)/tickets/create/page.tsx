/**
 * Ticket creation page, where a user can create a new ticket to sell
 *
 * @since ticketmaster-api--JP
 */
'use client';
import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EventSearch from '../../../../components/EventSearch';
import { API } from '../../../../lib/api/dicts/API';
import { getDateSegments } from '../../../../lib/DateMethods';
import EventViewer from '../../../../components/EventViewer';
import Button from '@mui/material/Button';

export default function TicketCreatePage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [confirmedEvent, setConfirmedEvent] = useState(false);

  const onEventSelected = async (event: any) => {

    const detailedEvent = await API.tick!.getEventDetails!(event.id) as EventDetails;

    const dateSegments = getDateSegments(new Date(detailedEvent.date));
    detailedEvent.description = `${dateSegments.time} | ${detailedEvent.location}`;
    detailedEvent.dateSegments = dateSegments;

    setSelectedEvent(detailedEvent);
  }

  const headerImages = [ 'c1', 'c2', 'c3', 'c4', 'c5' ];
  const randomHeaderImage = headerImages[Math.floor(Math.random() * headerImages.length)];

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      {/* SECTION 1: SELECTING AN EVENT TO SELL TICKETS FOR */}
      {!selectedEvent ? (
        <Container>
          <Box
            sx={{
              mt: 12,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" sx={{ mb: 2, fontWeight: 400, fontFamily: 'oswald', fontSize: '40px', mb: 0 }}>
              Sell Your Tickets
            </Typography>
            <Typography component="h5" sx={{ mb: 2, fontWeight: 400, fontSize: '18px' }}>
              Sell your tickets to events you're attending.
            </Typography>

            <Box sx={{
              my: 2,
              minWidth: '100%',
              // Set a max-width that increases at specific breakpoints
              maxWidth: {
                xs: '500px', // max-width on extra-small screens
                md: '900px', // max-width on medium screens
                lg: '1200px', // max-width on large screens
              },
            }}>
              <EventSearch onSelect={onEventSelected} />
            </Box>
          </Box>
        </Container>
      ) : (
        null
      )}

      {/* SECTION 2: CONFIRMING THE EVENT TO SELL TICKETS FOR */}
      {selectedEvent && !confirmedEvent ? (
        <Box>
          <Box
            sx={{
              minWidth: '100%',
              backgroundImage: `url(/${randomHeaderImage}.jpg)`,
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
                xs: '0px',
                sm: '0px',
                md: '220px',
                lg: '220px',
                xl: '220px',
              },
              opacity: (theme) => theme.palette.mode === 'dark' ? 0.35 : 0.6,
            }}
          >

          </Box>
          <Typography component="h1" sx={{ mb: 2, fontWeight: 400, fontFamily: 'oswald', fontSize: '40px', mb: 0 }}>
            Is this the event you want to sell tickets for?
          </Typography>
          <Typography component="h5" sx={{ mb: 2, fontWeight: 400, fontSize: '18px' }}>
            If not, you can search again for a different event.
          </Typography>

          <Box sx={{
            my: 2,
            width: '100%',
            // Set a max-width that increases at specific breakpoints
            maxWidth: {
              xs: '500px', // max-width on extra-small screens
              md: '900px', // max-width on medium screens
              lg: '1200px', // max-width on large screens
            },
          }}>
            <EventViewer eventId={selectedEvent.id as string}>
              <Button variant="contained" color="primary" onClick={() => setConfirmedEvent(true)}>
                Confirm
              </Button>
            </EventViewer>
          </Box>
        </Box>
      ) : (
        null
      )}

      {/* SECTION 3: CONFIRMED THE EVENT TO SELL TICKETS FOR */}
      {confirmedEvent ? (
        <>
          <Typography component="h1" sx={{ mb: 2, fontWeight: 400, fontFamily: 'oswald', fontSize: '40px', mb: 0 }}>
            Confirming the event to sell tickets for...
          </Typography>
        </>
      ) : (
        null
      )}
    </Container>
  );
}
