/**
 * Main page hero carousel: event slides with left panel (title + See Tickets) and image.
 * Auto-advances every 6s; dot controls overlay the left panel.
 */
'use client'

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useTheme } from '@mui/material/styles';

export interface MainPageCarouselEvent {
  attractions?: { name: string; externalLinks: Record<string, string>; classifications: string[] };
  image: string | null;
  date: Date;
  location: string;
  title: string;
  tmEventId: string;
  dateSegments?: { month: string; day: number; weekday: string };
}

const SLIDE_MIN_WIDTH_PX = 400;
const SLIDE_MAX_WIDTH_PX = 750;
const LEFT_PANEL_WIDTH_PERCENT = 38;

export default function MainPageCarousel({
  events,
}: {
  events: Array<[title: string, event: MainPageCarouselEvent]>;
}) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || events.length <= 1) return;
    const interval = setInterval(scrollNext, 6000);
    return () => clearInterval(interval);
  }, [emblaApi, events.length, scrollNext]);

  if (!mounted) return null;

  if (events.length === 0) {
    return (
      <Box sx={{ width: '100%', mt: 2, textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No events to show. Tickets need a populated event—check that the tickets API returns events and that{' '}
          <code>getAllTickets</code> is loading.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ px: 1 }}>
        <Box
          ref={emblaRef}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            width: '50vw',
            minWidth: SLIDE_MIN_WIDTH_PX,
            maxWidth: SLIDE_MAX_WIDTH_PX,
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '6px 6px 24px rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              touchAction: 'pan-y pinch-zoom',
            }}
          >
            {events.map(([title, event]) => (
              <Box
                key={title}
                sx={{
                  flex: '0 0 100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  aspectRatio: '16/10',
                  overflow: 'hidden',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    width: `${LEFT_PANEL_WIDTH_PERCENT}%`,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 1,
                    py: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'info.dark' : 'secondary.main',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="p"
                    sx={{
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 400,
                      mb: 2,
                      fontSize: {
                        xs: '1.1rem',
                        sm: '1.1rem',
                        md: '1.2rem',
                        lg: '1.7rem',
                        xl: '1.7rem',
                      },
                      fontFamily: 'oswald',
                    }}
                  >
                    {title}
                  </Typography>
                  <Button
                    component={Link}
                    href={`/tickets/event/${event.tmEventId}`}
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontSize: {
                        xs: '.7rem',
                        sm: '.7rem',
                        md: '.8rem',
                        lg: '.8rem',
                        xl: '.8rem',
                      },
                      padding: {
                        xs: '.2rem .5rem',
                        sm: '.2rem .5rem',
                        md: '.4rem .9rem',
                        lg: '.4rem .9rem',
                        xl: '.4rem .9rem',
                      },
                      '&:hover': {
                        borderColor: 'grey.300',
                        bgcolor: 'rgba(255,255,255,0.08)',
                      },
                    }}
                  >
                    See Tickets
                  </Button>
                </Box>
                {event.image ? (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                    }}
                  >
                    <Box
                      component="img"
                      src={event.image}
                      alt={title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: 'action.hover',
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            {events.map((_, index) => (
              <Box
                key={index}
                onClick={() => scrollTo(index)}
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: index === selectedIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: index === selectedIndex ? 'white' : 'rgba(255,255,255,0.7)' },
                }}
                aria-label={`Go to slide ${index + 1}`}
                role="button"
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
