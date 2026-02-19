/**
 * Small top event details banner for mobile devices
 *
 * @since buy-tickets--JP
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import type { EventDetails } from '@bigtix/common';


export default function MobileEventBanner({ event }: { event: EventDetails }) {
  const theme = useTheme();
  const boxShadow = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return 'none';
      }

      return '0 3px 6px 0 rgba(0, 0, 0, 0.2)';
    },
    [theme.palette.mode]
  );

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
    <Box
      sx={{
        width: '100%',
        boxShadow: boxShadow,
        bgcolor: backgroundColor,
        borderRadius: '8px',
        display: 'flex',
        padding: 1,
      }}>
        <Box
          component="img"
          sx={{
            width: '33%',
            minWidth: '33%',
            objectFit: 'cover',
            opacity: 1,
            position: 'relative',
            borderRadius: '8px 0 0 8px',
          }}
          alt={`${event.name} image`}
          src={event.image.url}
        />
        <Box ml={1.5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ lineHeight: '20px', fontSize: '1.2rem', fontFamily: 'oswald', fontWeight: 600 }}>{event.name}</Typography>
        </Box>
    </Box>
  );
}