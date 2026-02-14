/**
 * Ticket search page for users to search for events with tickets for sale
 *
 * @since ticketmaster-api--JP
 */
'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EventSearch from '../../../../components/EventSearch';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function TicketSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);
  const [searchOptions, setSearchOptions] = useState<{ initialSearch: string; eventItemBtnLabel: string; searchPlaceholder: string }>({ initialSearch: '', eventItemBtnLabel: 'Buy Tickets', searchPlaceholder: 'Search for an event...' });

  const onEventSelected = async (event: any) => {
    router.push(`/tickets/event/${event.id}`);
  }

  useEffect(() => {
    const loadEventStates = async () => {
      const searchParam = searchParams.get('keywords');
      const initialSearch = searchParam ? decodeURIComponent(searchParam as string) : '';
      setSearchOptions({
        initialSearch,
        eventItemBtnLabel: 'Buy Tickets',
        searchPlaceholder: 'Search for an event...'
      });

      setLoaded(true);

      return;
    }

    loadEventStates();
  }, []);

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      {/* SEARCHING FOR AN EVENTS WITH TICKETS AVAILABLE FOR SALE */}
      {loaded ? (
        <Container maxWidth="lg" disableGutters>
          <Box
            sx={{
              mt: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" sx={{ fontWeight: 400, fontFamily: 'oswald', fontSize: '40px' }}>
              Search for Events
            </Typography>

            <Box sx={{
              my: 2,
              width: '100%',
              // Set a max-width that increases at specific breakpoints
              maxWidth: {
                xs: '400px', // max-width on extra-small screens
                md: '900px', // max-width on medium screens
                lg: '1200px', // max-width on large screens
              },
            }}>
              <EventSearch onSelect={onEventSelected} options={searchOptions} />
            </Box>
          </Box>
        </Container>
      ) : (
        null
      )}
    </Container>
  );
}
