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
import { useState, useEffect } from 'react';
import { API } from '../lib/api/dicts/API';
import type { EventDetails } from '@bigtix/common';
import { Skeleton } from '@mui/material';

type EventViewerProps = {
  children?: React.ReactNode;
  eventId: string;
};

export default function EventViewer({ eventId, children }: EventViewerProps) {
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
          <Box sk={{ width: '100%', height: '100%', display: 'flex' }}>
            
          </Box>

          {children}




          <Typography variant="h6">{detailedEvent.name}</Typography>
            <Typography variant="body1">{detailedEvent.location}</Typography>
            {detailedEvent.image ? (
              <Box
                component="img"
                sx={{
                  // height: 100,
                  width: '60%',
                  maxWidth: '60%',
                  objectFit: 'cover',
                }}
                alt={`${detailedEvent.name} image`}
                src={detailedEvent.image.url}
              />
            ) : null}
          {detailedEvent.attractions.length > 0 ?
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
          <Typography variant="body1">{detailedEvent.description}</Typography>
          <DateDisplay month={detailedEvent.dateSegments.month} day={detailedEvent.dateSegments.day} weekday={detailedEvent.dateSegments.weekday} />
          
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