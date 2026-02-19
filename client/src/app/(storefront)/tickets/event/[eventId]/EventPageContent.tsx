/**
 * Event details component. Displays the details of an detailedEvent.
 *
 * @since ticketmaster-api--JP
 */
'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppLink from '../../../../../components/AppLink';
import { useState, useEffect, useMemo } from 'react';
import type { EventDetails } from '@bigtix/common';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Collapse from '@mui/material/Collapse';
import { STYLE_CONSTS } from '../../../../../styles/consts';
import type { SavedTicketDoc } from '../../../../../../../tickets-srv/src/models/Ticket';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import IconButton from '@mui/material/IconButton';
import MobileEventBanner from '../../../../../components/MobileEventBanner';
import DateDisplay from '../../../../../components/DateDisplay';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

type EventPageContentProps = {
  event: {
    id: string;
    name: string;
    date: Date;
    location: string;
    image: string;
    attractions?: { name: string; externalLinks: Record<string, string>; classifications: string[] }[];
    description: string;
    dateSegments?: { month: string; day: number; weekday: string };
    info?: string;
  };
  availableTickets: SavedTicketDoc[] | null;
};

export default function EventPageContent({ event, availableTickets }: EventPageContentProps) {
  const theme = useTheme();
  const tickets = availableTickets ?? [];
  const [loaded, setLoaded] = useState(false);
  const headerImages = [ 'c1', 'c2', 'c3', 'c4', 'c5' ];
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<any>(null);
  const [detailedEventInfo, setDetailedEventInfo] = useState<string[] | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);

  /**
   * External link icon for links in the attractions shown in the event viewer
   *
   * @param {string} linkName - The name of the link
   * @param {string} linkValue - The value of the link
   *
   * @returns {React.ReactNode} - The external link icon
   */
  const externalLinkIcon = (linkName: string, linkValue: string) => {
    switch (linkName) {
      case 'x':
      case 'twitter':
        return <AppLink
          sx={{ '&:hover': { color: linkHoverColor } }}
          href={linkValue} target="_blank"><XIcon /></AppLink>;
      case 'facebook':
        return <AppLink
          sx={{ '&:hover': { color: linkHoverColor } }}
          href={linkValue} target="_blank"><FacebookIcon /></AppLink>;
      case 'instagram':
        return <AppLink
          sx={{ '&:hover': { color: linkHoverColor } }}
          href={linkValue} target="_blank"><InstagramIcon /></AppLink>;
      case 'youtube':
        return <AppLink
          sx={{ '&:hover': { color: linkHoverColor } }}
          href={linkValue} target="_blank"><YouTubeIcon /></AppLink>;
      case 'homepage':
        return <AppLink
          sx={{ '&:hover': { color: linkHoverColor } }}
          href={linkValue} target="_blank"><OpenInNewIcon /></AppLink>;
      default:
        return null;
    }
  };

  /**
   * Filter external links in attractions for the event viewer
   *
   * @param {EventDetails} event - The event details
   */
  const filterExternalLinksInAttractions = async (event: EventDetails) => {
    for (const attraction of event.attractions ?? []) {
      const filteredLinks: Record<string, string> = {};
      if (!attraction.externalLinks) continue;

      for (const [key, value] of Object.entries(attraction.externalLinks)) {
        if (externalLinkIcon(key!, value) !== null) {
          filteredLinks[key!] = value;
        }
      }
      attraction.externalLinks = filteredLinks;
    }
  };

  /**
   * Set the detailed event info if it is available
   *
   * @param event 
   */
  const setDetailedEventInfoIfAvailable = async (event: EventDetails) => {
    if (event.info) {
      setDetailedEventInfo(event.info.split('. ').map((info) => info.trim()));
    }
  };

  /**
   * Background color for the simple event item, dark mode is different from light mode
   *
   * @type {string}
   */
  const eventBoxBGColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return alpha(theme.palette.common.white, 0.15);
      }

      return '#ffffff';
    },
    [theme]
  );

  /**
   * Classification colors for the event viewer, dark mode is different from light mode
   *
   * @type {object}
   */
  const classificationColors = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return {
          bg: alpha(theme.palette.info.light, .7),
          color: 'white',
        };
      }

      return {
        bg: alpha(theme.palette.info.light, 0.2),
        color: theme.palette.info.dark,
      };
    },
    [theme.palette.mode]
  );

  /**
   * Link hover color for the event viewer, dark mode is different from light mode
   *
   * @type {string}
   */
  const linkHoverColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return alpha(theme.palette.info.light, 0.7);
      }

      return theme.palette.info.dark;
    },
    [theme]
  );

  useEffect(() => {
    setHeaderImage(headerImages[Math.floor(Math.random() * headerImages.length)] || null);

    filterExternalLinksInAttractions(event as unknown as EventDetails);

    setDetailedEventInfoIfAvailable(event);

    setLoaded(true);

    setTimeout(() => {
      setDetailedEvent(event);
    }, 1000);
  }, []);

  return (
    <Container sx={{ minWidth: '100%', height: '100%', paddingBottom: 10 }} disableGutters>
      {/* VIEWING THE EVENT DETAILS, AND TICKETS AVAILABLE FOR IT */}
      <Collapse in={loaded} timeout={500} sx={{ minWidth: '100%' }}>
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

      {loaded ? (
        <Container
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '100vw',
            // marginTop: 10
          }}
        >
          <Box sx={{
            mt: 2,
            width: '100%',
            // Set a max-width that increases at specific breakpoints
            maxWidth: {
              xs: '450px', // max-width on extra-small screens
              sm: '450px', // max-width on small screens
              md: '900px', // max-width on medium screens
              lg: '1200px', // max-width on large screens
              xl: '1200px', // max-width on extra-large screens
            },
          }}>
            <Box>
              {!detailedEvent ? (
                null
              ) : (
                <Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      mt: {
                        xs: 3,
                        sm: 3,
                        md: -7.5,
                        lg: -7.5,
                        xl: -7.5,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: {
                          xs: 'static',
                          sm: 'static',
                          md: 'relative',
                          lg: 'relative',
                          xl: 'relative',
                        },
                        width: {
                          xs: '100%',
                          sm: '100%',
                          md: '65%',
                          lg: '65%',
                          xl: '65%',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          display: {
                            xs: 'none',
                            sm: 'none',
                            md: 'block',
                            lg: 'block',
                            xl: 'block',
                          },
                          fontSize: {
                            xs: '2rem',
                            sm: '2rem',
                            md: '2.4rem',
                            lg: '2.5rem',
                            xl: '2.5rem',
                          },
                          fontWeight: 400,
                          fontFamily: 'oswald',
                        }}
                      >
                        {detailedEvent.name}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          maxWidth: '95%',
                          display: {
                            xs: 'none',
                            sm: 'none',
                            md: 'block',
                            lg: 'block',
                            xl: 'block',
                          },
                        }}>
                        {detailedEventInfo && detailedEventInfo.length > 0 ? (
                          <Box>
                            <Box
                              component="button"
                              onClick={() => setInfoExpanded((e) => !e)}
                              aria-label="Information"
                              aria-expanded={infoExpanded}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0.75,
                                font: 'inherit',
                                color: 'primary.main',
                                '&:hover': { color: 'primary.dark' },
                              }}
                            >
                              <InfoOutlineIcon sx={{ fontSize: '1.75rem' }} />
                              <Typography component="span" variant="body1" fontWeight={500} sx={{ fontSize: '1.1rem' }}>Information</Typography>
                            </Box>
                            <Collapse in={infoExpanded}>
                              <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5, fontWeight: 400, fontSize: '.8rem' }}>
                                {detailedEventInfo.map((item, index) => (
                                  <Typography key={index} component="li" variant="body1" sx={{ mb: 0.5 }}>{item}</Typography>
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        ) : null}
                      </Box>

                      <Box
                        sx={{
                          maxWidth: '100%',
                          display: {
                            xs: 'flext',
                            sm: 'flex',
                            md: 'none',
                            lg: 'none',
                            xl: 'none',
                            flexDirection: 'column',
                          },
                        }}
                      >
                        <MobileEventBanner event={detailedEvent} />
                      </Box>

                      <Box
                        mt={4}
                        sx={{
                          width: {
                            xs: '100%',
                            sm: '100%',
                            md: '85%',
                            lg: '85%',
                            xl: '85%',
                          },
                        }}
                      >
                        {tickets.length === 0 ? (
                          <Typography variant="h4" sx={{ fontSize: {'xs': '2rem', 'sm': '2rem', 'md': '1.8rem', 'lg': '1.8rem', 'xl': '1.8rem' } }} fontFamily="oswald">No listings found for this event yet...</Typography>
                        ) : (
                          <>
                            {tickets.length === 1 ? (
                              <Typography variant="h4" sx={{ fontSize: {'xs': '2rem', 'sm': '2rem', 'md': '1.8rem', 'lg': '1.8rem', 'xl': '1.8rem' } }} fontFamily="oswald">1 Listing:</Typography>
                            ) : (
                              <Typography variant="h4" sx={{ fontSize: {'xs': '2rem', 'sm': '2rem', 'md': '1.8rem', 'lg': '1.8rem', 'xl': '1.8rem' } }} fontFamily="oswald">{tickets.length} Listings:</Typography>
                            )}
                          </>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Box mt={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {tickets.map((ticket) => (
                            <Box
                              key={ticket.id}
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                              }}
                            >
                              {detailedEvent?.dateSegments ? (
                                <DateDisplay
                                  month={detailedEvent.dateSegments.month}
                                  day={detailedEvent.dateSegments.day}
                                  weekday={detailedEvent.dateSegments.weekday}
                                />
                              ) : null}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                  <Typography variant="subtitle1" fontWeight={700}>{ticket.description}</Typography>
                                  <Typography variant="h6" fontWeight={700}>${ticket.price}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} fontWeight={400}>
                                  {detailedEvent?.description ?? ''}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                  <IconButton color="primary" size="small" aria-label="Add to cart">
                                    <AddShoppingCartIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                    </Box>
                    <Box
                      sx={{
                        mt: detailedEvent.image ? -10 : 1,
                        width: '35%',
                        alignSelf: 'flex-start',
                        display: {
                          xs: 'none',
                          sm: 'none',
                          md: 'flex',
                          lg: 'flex',
                          xl: 'flex',
                        },
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        borderRadius: 4,
                        boxShadow: '0 5px 8px 0px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          minWidth: '100%',
                          position: 'relative',
                          backgroundColor: eventBoxBGColor,
                          borderRadius: '12px 12px 12px 12px',
                        }}
                      >
                        {detailedEvent.image ? (
                          <Box
                            component="img"
                            sx={{
                              width: '100%',
                              minWidth: '100%',
                              objectFit: 'cover',
                              opacity: 1,
                              position: 'relative',
                              borderRadius: '12px 12px 0 0',
                            }}
                            alt={`${detailedEvent.name} image`}
                            src={detailedEvent.image.url}
                          />
                        ) : null}

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 2,
                          }}
                        >
                          {detailedEvent.attractions.map((attraction: { name: string; externalLinks?: Record<string, string>, classifications: string[] }) => (
                              <Box key={attraction.name}>
                                <Typography sx={{ mb: 1 }} variant="h6" fontFamily="oswald" key={attraction.name}>{attraction.name}</Typography>

                                {attraction.classifications.length > 0 ? (
                                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 2, maxWidth: '100%', flexWrap: 'wrap' }}>
                                    {attraction.classifications.map((classification, index) => (
                                      <Box key={index} sx={{ color: classificationColors.color, borderRadius: 1.5, padding: '.2rem .6rem', backgroundColor: classificationColors.bg }}>{classification}</Box>
                                    ))}
                                  </Box>
                                ) : null}

                                {attraction.externalLinks && Object.keys(attraction.externalLinks).length > 0 ? (
                                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 2, maxWidth: '100%', flexWrap: 'wrap' }}>
                                    {Object.entries(attraction.externalLinks).map(([key, value]) => (
                                      <Box key={key}>
                                        {externalLinkIcon(key!, value)}
                                      </Box>
                                    ))}
                                  </Box>
                                ) : null}

                                <Divider sx={{ my: 2 }} />
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      ) : (
        null
      )}
    </Container>
  );  
}
