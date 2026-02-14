/**
 * Simple small event item component. Displays the event with no picture, or buttons
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DateDisplay from './DateDisplay';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';

type EventItemProps = {
  size: 'small' | 'regular';
  name?: string;
  dateSegments: { month: string, day: number, weekday: string };
  description: string;
};

export default function EventItem({ size, name, dateSegments, description }: EventItemProps) {
  const theme = useTheme();

  /**
   * Box shadow for the simple event item, dark mode is different from light mode
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
   * Background color for the simple event item, dark mode is different from light mode
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
    <Box
      sx={{
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
        gap: 1,
        alignItems: 'center',
      }}
    >
      {/* Column 1: date segments – pill block, day emphasized, weekday strip (theme-aware, inverts in dark) */}
      <Box>
        <DateDisplay month={dateSegments!.month} day={dateSegments!.day} weekday={dateSegments!.weekday} />
      </Box>
      {/* Column 2: event name, description (flexible) */}
      <Box sx={{
        paddingLeft: 1,
        paddingRight: 1,
        minHeight: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}>
        {name ? (
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'oswald',
              fontSize: {
                xs: '12px', // max-width on extra-small screens
                sm: '12px', // max-width on small screens
                md: size === 'small' ? '14px' : '16px', // max-width on medium screens
                lg: size === 'small' ? '15px' : '18px', // max-width on large screens
                xl: size === 'small' ? '15px' : '18px', // max-width on extra-large screens
              },
              mb: 1,
            }}>
              {name}
            </Typography>
          ) : (null)
        }
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: {
              xs: '12px', // max-width on extra-small screens
              sm: '12px', // max-width on small screens
              md: size === 'small' ? '12px' : '14px', // max-width on medium screens
              lg: size === 'small' ? '13px' : '16px', // max-width on large screens
              xl: size === 'small' ? '13px' : '16px', // max-width on extra-large screens
            },
          }}>
            {description}
        </Typography>
      </Box>
    </Box>
  );
}