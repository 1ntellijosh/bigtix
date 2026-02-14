/**
 * Initial page for selling tickets. You search for an event that you want to sell tickets for. When you click on the
 * event, it will take you to the ticket creation page.
 *
 * @since create-tickets--JP
 */
'use client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EventSearch from '../../../components/EventSearch';
import { API } from '../../../lib/api/dicts/API';
import { useState } from 'react';
import type { SavedEventDoc } from '../../../../../tickets-srv/src/models/Event';
import TicketsForm from '../../../components/TicketsForm';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { getDateSegments } from '../../../lib/DateMethods';
import EventItem from '../../../components/EventItem';

export default function SellTicketsSearchPage() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<SavedEventDoc | null>(null);
  const [successfulCreate, setSuccessfulCreate] = useState(false);
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventDateSegments, setEventDateSegments] = useState<{ month: string, day: number, weekday: string } | null>(null);

  const onEventSelected = async (event: any) => {
    const dateSegments = getDateSegments(new Date(event.date));
    setEventDateSegments(dateSegments);
    setEventDescription(`${event.location}`);

    const createdEvent = await API.tick!.createEvent!({ tmEventId: event.id }) as unknown as SavedEventDoc;

    setSelectedEvent(createdEvent);
  };

  const onSuccessfulCreate = () => {
    setSuccessfulCreate(true);
  }

  return (
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
        {!selectedEvent ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography component="h1" sx={{ margin: 'auto', fontWeight: 400, fontFamily: 'oswald', fontSize: '40px' }}>
              Sell Your Tickets
            </Typography>
            <Typography component="h5" sx={{ margin: 'auto', mb: 2, fontWeight: 400, fontSize: '18px' }}>
              BigTix is the one-stop-shop for ticket buyers and sellers.
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'column',
              md: 'row',
              lg: 'row',
              xl: 'row',
            },
            justifyContent: {
              xs: 'center',
              sm: 'center',
              md: successfulCreate ? 'center' : 'flex-start',
              lg: successfulCreate ? 'center' : 'flex-start',
              xl: successfulCreate ? 'center' : 'flex-start',
            },
            alignItems: {
              xs: 'center',
              sm: 'center',
              md: 'flex-start',
              lg: 'flex-start',
              xl: 'flex-start',
            },
          }}>
            <Box
              sx={{
                // marginTop: 'auto',
              }}>
              {!successfulCreate ? (
              <Typography component="h1" sx={{  fontWeight: 400, fontFamily: 'oswald', fontSize: '40px' }}>
                  Selling Tickets for:
                </Typography>
              ) : (
                <Typography component="h1" sx={{  fontWeight: 400, fontFamily: 'oswald', fontSize: '40px' }}>
                  All Done!
                </Typography>
              )}
            </Box>
            {selectedEvent && !successfulCreate ? (
              <Box sx={{
                maxWidth: '400px',
                marginLeft: {
                  xs: 0,
                  sm: 0,
                  md: 3,
                  lg: 3,
                  xl: 3,
                },
                display: 'flex',
                marginTop: {
                  xs: '10px',
                  sm: '10px',
                  md: 0,
                  lg: 0,
                  xl: 0,
                },
                justifyContent: {
                  xs: 'center',
                  sm: 'center',
                  md: 'flex-end',
                  lg: 'flex-end',
                  xl: 'flex-end',
                },
              }}>
                <EventItem size="small" name={selectedEvent.title} dateSegments={eventDateSegments!} description={eventDescription} />
              </Box>
            ) : null}
          </Box>
        )}

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
          {!selectedEvent ? (
            <EventSearch
              onSelect={onEventSelected}
              options={{
                initialSearch: '',
                eventItemBtnLabel: 'Sell Tickets',
                searchPlaceholder: 'Search your event and start selling...'
              }}
            />
          ) : (
            null
          )}

          {selectedEvent && !successfulCreate ? (
            <TicketsForm event={selectedEvent} onSuccessfulCreate={onSuccessfulCreate} />
          ) : (
            null
          )}

          {successfulCreate ? (
            <Box sx={{ margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Typography component="h5" sx={{ textAlign: 'center', mb: 2, fontWeight: 400, fontSize: '20px' }}>
                Your tickets are entered for sale! We will email you a link to your tickets shortly. Click the button below to return to the home page.
              </Typography>
              <Box sx={{ mt: 2}}>
                <Button variant="contained" color="primary" onClick={() => router.push('/')}>
                  Return to Home Page
                </Button>
              </Box>
            </Box>
          ) : (
            null
          )}
        </Box>
      </Box>
    </Container>
  );
}