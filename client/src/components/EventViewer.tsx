/**
 * Event details component. Displays the details of an detailedEvent.
 *
 * @since ticketmaster-api--JP
 */
'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DateDisplay from './DateDisplay';
import { getDateSegments } from '../lib/DateMethods';
import AppLink from './AppLink';
import { useState, useEffect, useMemo } from 'react';
import { API } from '../lib/api/dicts/API';
import type { EventDetails } from '@bigtix/common';
import { Skeleton } from '@mui/material';
import EventItem from './EventItem';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Divider from '@mui/material/Divider';

type EventViewerProps = {
  children?: React.ReactNode;
  eventId: string;
};

export default function EventViewer({ eventId, children }: EventViewerProps) {
  const theme = useTheme();
  const [detailedEvent, setDetailedEvent] = useState<any>(null);

  const fetchDetailedEvent = async () => {
    const detailedEvent = await API.tick!.getEventDetails!(eventId) as unknown as EventDetails;

    console.log('raw event: ', JSON.parse(JSON.stringify(detailedEvent)), null, 2);

    await addDateSegmentsToEvent(detailedEvent);

    fixEmptyAttractionsEvent(detailedEvent);

    await filterExternalLinksInAttractions(detailedEvent);

    console.log(detailedEvent);
    
    console.log('finished event: ', detailedEvent);

    setTimeout(() => {
      setDetailedEvent(detailedEvent);
    }, 1000);
  };

  /**
   * Add date segments to the event details
   *
   * @param {EventDetails} event - The event details
   */
  const addDateSegmentsToEvent = async (event: EventDetails) => {
    const dateSegments = getDateSegments(new Date(event.date!));
    event.description = `${dateSegments.time} | ${event.location}`;
    event.dateSegments = { year: dateSegments.year, month: dateSegments.month, day: dateSegments.day.toString(), weekday: dateSegments.weekday };
  }

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
   * Fix empty attractions event
   *
   * @param {EventDetails} event - The event details
   */
  const fixEmptyAttractionsEvent = (event: EventDetails) => {
    if (!event.attractions.length) {
      const dateSegments = event.dateSegments!;
      event.attractions.push({
        name: `${dateSegments.month} ${dateSegments.day} ${new Date(event.date!).getFullYear()}`,
        externalLinks: {},
        classifications: [] });
    }
  }

  /**
   * Filter external links in attractions for the event viewer
   *
   * @param {EventDetails} event - The event details
   */
  const filterExternalLinksInAttractions = async (event: EventDetails) => {
    for (const attraction of event.attractions) {
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
  );

  useEffect(() => {
    fetchDetailedEvent();
  }, [eventId]);

  return (
    <Box>
      {!detailedEvent ? (
        <Box>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

          {/* For other variants, adjust the size with `width` and `height` */}
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={210} height={60} />
          <Skeleton variant="rounded" width={210} height={60} />
        </Box>
      ) : (
        <Box>
          <Box sx={{ width: '100%', display: 'flex', mt: -8 }}>
            <Box sx={{ position: 'relative', width: '58%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 400,
                  fontFamily: 'oswald',
                  fontSize: {
                    xs: '1.2em',
                    sm: '1.5em',
                    md: '1.5em',
                    lg: '2em',
                    xl: '2em',
                  }
                }}
              >
                {detailedEvent.name}
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  maxWidth: '95%',
                }}>
                <EventItem size="regular" dateSegments={detailedEvent.dateSegments!} description={detailedEvent.description!} />
              </Box>

              <Box sx={{ mt: 3 }}>
                {children}
              </Box>
            </Box>
            <Box
              sx={{ mt: detailedEvent.image ? -10 : 1,
                width: '42%',
                display: 'flex',
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
  );
}

// {
//   "name": "My Chemical Romance with Special Guest The Used",
//   "id": "vvG1iZbS55yKJr",
//   "location": "Hollywood Bowl | 2301 N Highland Ave, Hollywood, California, United States Of America",
//   "date": "2026-10-31T02:00:00.000Z",
//   "image": {
//       "ratio": "3_2",
//       "url": "https://s1.ticketm.net/dam/a/b67/0aae6aa9-4e17-482b-81d9-5282ff937b67_TABLET_LANDSCAPE_3_2.jpg",
//       "width": 1024,
//       "height": 683,
//       "fallback": false
//   },
//   "attractions": [
//       {
//           "name": "My Chemical Romance",
//           "externalLinks": {
//               "youtube": "https://www.youtube.com/user/mychemicalromance",
//               "twitter": "https://twitter.com/mcrofficial",
//               "itunes": "https://itunes.apple.com/artist/id14748659",
//               "lastfm": "http://www.last.fm/music/My+Chemical+Romance",
//               "wiki": "https://en.wikipedia.org/wiki/My_Chemical_Romance",
//               "facebook": "https://www.facebook.com/MyChemicalRomance",
//               "spotify": "https://open.spotify.com/artist/7FBcuc1gsnv6Y1nwFtNRCb",
//               "musicbrainz": "https://musicbrainz.org/artist/c07f0676-9143-4217-8a9f-4c26bd636f13",
//               "instagram": "https://www.instagram.com/mychemicalromance/",
//               "homepage": "http://www.mychemicalromance.com/"
//           },
//           "classifications": [
//               "Music",
//               "Rock",
//               "Alternative Rock"
//           ]
//       },
//       {
//           "name": "The Used",
//           "externalLinks": {
//               "youtube": "https://www.youtube.com/user/THEUSEDCHANNEL",
//               "twitter": "https://twitter.com/wearetheused",
//               "itunes": "https://itunes.apple.com/us/artist/id799141",
//               "lastfm": "http://www.last.fm/music/The+Used",
//               "wiki": "https://en.wikipedia.org/wiki/The_Used",
//               "facebook": "https://www.facebook.com/TheUsed",
//               "spotify": "https://open.spotify.com/artist/55VydwMyCuGcavwPuhutPL",
//               "musicbrainz": "https://musicbrainz.org/artist/8262d8e4-9137-4bb3-a787-3caabbbc13e9",
//               "instagram": "https://instagram.com/theused",
//               "homepage": "http://theused.net/"
//           },
//           "classifications": [
//               "Music",
//               "Rock",
//               "Alternative Rock"
//           ]
//       }
//   ],
//   "description": "",
//   "dateSegments": null
// }