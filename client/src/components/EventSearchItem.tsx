/**
 * Event search item component. Displays an event from TicketMaster API search result.
 *
 * @since ticketmaster-api--JP
 */
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function EventSearchItem({ id, item }: { id: string, item: any }) {
  const theme = useTheme();
  const router = useRouter();
  /**
   * Marks if the search item is hovered with mouse, triggers hover effects
   *
   * @type {boolean}
   */
  const [hovered, setHovered] = useState(false);
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

      return hovered ? '0 4px 8px 1px rgba(0, 0, 0, 0.3)' : '0 3px 6px 0 rgba(0, 0, 0, 0.2)';
    },
    [hovered]
  );
  /**
   * Background color for the search item, dark mode is different from light mode
   *
   * @type {string}
   */
  const backgroundColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return hovered ? alpha(theme.palette.common.white, 0.25) : alpha(theme.palette.common.white, 0.15);
      }

      return '#ffffff';
    },
    [theme, hovered]
  );
  /**
   * Button color for the search item, dark mode is different from light mode
   *
   * @type {string}
   */
  const buttonColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return hovered ? 'primary' : 'secondary';
      }

      return hovered ? 'secondary' : 'primary';
    },
    [theme.palette.mode, hovered]
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
          xs: '.75fr 0fr 3fr 0fr',
          sm: '.75fr 0fr 3fr 0fr',
          md: '.75fr 1.2fr 3fr 1fr',
          lg: '.5fr 1.3fr 3.5fr 1fr',
          xl: '.5fr 1.3fr 3.5fr 1fr',
        },
        gap: 0,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.35s ease, background-color 0.35s ease',
      }}
      onClick={() => {
        router.push(`/tickets/sell/${id}`);
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {/* Column 1: date segments – pill block, day emphasized, weekday strip (theme-aware, inverts in dark) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          borderRadius: 2,
          overflow: 'hidden',
          minWidth: 50,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121212' : 'grey.300'),
        }}
      >
        <Box sx={{ py: 1, px: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: (theme) => (theme.palette.mode === 'dark' ? 'grey.200' : 'grey.700'),
            }}
          >
            {item.dateSegments.month}
          </Typography>

          <Typography
            component="span"
            sx={{
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.1,
              color: (theme) => (theme.palette.mode === 'dark' ? 'grey.100' : 'grey.800'),
            }}
          >
            {item.dateSegments.day}
          </Typography>
        </Box>

        <Box
          sx={{
            py: 0.75,
            px: 1.5,
            display: 'flex',
            justifyContent: 'center',
            borderRadius: '0 0 8px 8px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.400'),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: (theme) => (theme.palette.mode === 'dark' ? 'grey.200' : 'grey.700'),
            }}
          >
            {item.dateSegments.weekday}
          </Typography>
        </Box>
      </Box>
      {/* Column 2: event picture (fixed width) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {item.image ? (
          <Box
            component="img"
            sx={{
              height: 100,
              width: '60%',
              maxWidth: '60%',
              objectFit: 'cover',
            }}
            alt={`${item.name} image`}
            src={item.image.url}
          />
        ) : null}
      </Box>
      {/* Column 3: event name, description (flexible) */}
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
          variant="h6"
          sx={{
            fontFamily: 'oswald',
            fontSize: {
              xs: '15px', // max-width on extra-small screens
              md: '17px', // max-width on medium screens
              lg: '21px', // max-width on large screens
            },
          }}>
            {item.name}
        </Typography>

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
            {item.description}
        </Typography>
      </Box>
      {/* Column 4: sell tickets button (fixed by content) */}
      <Box sx={{
        display: {
          xs: 'none',
          sm: 'none',
          md: 'flex',
          lg: 'flex',
          xl: 'flex',
        },
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: {
          xs: 'center',
          sm: 'center',
          md: 'flex-start',
          lg: 'flex-start',
          xl: 'flex-start',
        },
      }}>
        <Button
          variant="contained"
          color={buttonColor}
          href={`/events/${id}`}
          sx={(theme) => ({
            fontSize: {
              xs: '12px',
              sm: '12px',
              md: '12px',
              lg: '16px',
              xl: '16px',
            },
            transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
          })}
        >
          Sell Tickets{' '}
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              width: hovered ? 24 : 0,
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.35s ease, width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
