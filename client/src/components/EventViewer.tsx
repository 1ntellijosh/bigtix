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
import { alpha, useTheme } from '@mui/material/styles';

type EventViewerProps = {
  children?: React.ReactNode;
  eventId: string;
};

export default function EventViewer({ eventId, children }: EventViewerProps) {
  const theme = useTheme();
  const [detailedEvent, setDetailedEvent] = useState<any>(null);

  const fetchDetailedEvent = async () => {
    const detailedEvent = await API.tick!.getEventDetails!(eventId) as unknown as EventDetails;

    const dateSegments = getDateSegments(new Date(detailedEvent.date!));
    detailedEvent.description = `${dateSegments.time} | ${detailedEvent.location}`;
    detailedEvent.dateSegments = { month: dateSegments.month, day: dateSegments.day.toString(), weekday: dateSegments.weekday };

    setTimeout(() => {
      setDetailedEvent(detailedEvent);
    }, 1000);
  };

  useEffect(() => {
    fetchDetailedEvent();
  }, [eventId]);

  /**
   * Box shadow for the search item, dark mode is different from light mode
   *
   * @type {string}
   */
  const boxShadow = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return 'none';
      }

      return '0 3px 6px 0 rgba(0, 0, 0, 0.2)';
    },
    [theme.palette.mode]
  );
  /**
   * Background color for the search item, dark mode is different from light mode
   *
   * @type {string}
   */
  const backgroundColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return alpha(theme.palette.common.white, 0.15);
      }

      return '#ffffff';
    },
    [theme]
  );

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
          <Box sx={{ width: '100%', display: 'flex' }}>
            <Box sx={{ width: '58%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography component="h2" sx={{ fontWeight: 400, fontFamily: 'oswald', fontSize: '30px' }}>
                {detailedEvent.name}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  maxWidth: '95%',
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingTop: 1,
                  paddingBottom: 1,
                  borderRadius: 2,
                  boxShadow: boxShadow,
                  bgcolor: backgroundColor,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '.75fr 3fr',
                    sm: '.75fr 3frr',
                    md: '.75fr 3fr',
                    lg: '.5fr 3.5fr',
                    xl: '.5fr 3.5fr',
                  },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                {/* Column 1: date segments – pill block, day emphasized, weekday strip (theme-aware, inverts in dark) */}
                <DateDisplay month={detailedEvent.dateSegments.month} day={detailedEvent.dateSegments.day} weekday={detailedEvent.dateSegments.weekday} />
                {/* Column 2: event name, description (flexible) */}
                <Box sx={{
                  paddingLeft: 1,
                  paddingRight: 1,
                  minHeight: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: {
                    xs: 'center',
                    sm: 'center',
                    md: 'flex-start',
                    lg: 'flex-start',
                    xl: 'flex-start',
                  },
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: {
                        xs: '12px', // max-width on extra-small screens
                        md: '14px', // max-width on medium screens
                        lg: '16px', // max-width on large screens
                      },
                    }}>
                      {detailedEvent.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                {children}
              </Box>
            </Box>
            <Box sx={{ mt: -10,width: '42%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {detailedEvent.image ? (
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    minWidth: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    position: 'relative',
                    borderRadius: 4,
                    boxShadow: '0 5px 8px 0px rgba(0, 0, 0, 0.5)',
                  }}
                  alt={`${detailedEvent.name} image`}
                  src={detailedEvent.image.url}
                />
              ) : null}

              {detailedEvent.attractions &&   detailedEvent.attractions.length > 0 ?
                (
                  <Box>
                    {detailedEvent.attractions.map((attraction: { name: string; externalLinks?: Record<string, string>, classifications: string[] }) => (
                      <Box key={attraction.name}>
                        <Typography variant="body1" key={attraction.name}>{attraction.name}</Typography>

                        {attraction.externalLinks && Object.keys(attraction.externalLinks).length > 0 ? (
                          <Box>
                            {Object.entries(attraction.externalLinks).map(([key, value]) => (
                              <Box key={key}>
                                <AppLink href={value}>{key}</AppLink>
                              </Box>
                            ))}
                          </Box>
                        ) : null}
                        {attraction.classifications.length > 0 ? (
                          <Box>
                            {attraction.classifications.map((classification) => (
                              <Box key={classification}>{classification}</Box>
                            ))}
                          </Box>
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                )
                : null
              }
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