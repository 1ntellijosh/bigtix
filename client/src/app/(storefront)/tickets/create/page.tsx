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

export default function TicketCreatePage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        {/* SECTION 1: SELECTING AN EVENT TO SELL TICKETS FOR */}
        <Typography component="h1" sx={{ mb: 2, fontWeight: 400, fontFamily: 'oswald', fontSize: '40px', mb: 0 }}>
          Sell Your Tickets
        </Typography>
        <Typography component="h5" sx={{ mb: 2, fontWeight: 400, fontSize: '18px' }}>
          Sell your tickets to events you're attending.
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
          <EventSearch selectedEventHandler={setSelectedEvent} />
        </Box>

        {/* SECTION 2: CONFIRMING THE EVENT TO SELL TICKETS FOR */}
        <Typography component="h1" sx={{ mb: 2, fontWeight: 400, fontFamily: 'oswald', fontSize: '40px', mb: 0 }}>
          Is this the event you want to sell tickets for?
        </Typography>
        <Typography component="h5" sx={{ mb: 2, fontWeight: 400, fontSize: '18px' }}>
          If not, you can search again for a different event.
        </Typography>

        <Box>
          
        </Box>
      </Box>
    </Container>
  );
}