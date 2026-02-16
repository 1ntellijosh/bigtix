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
import DateDisplay from './DateDisplay';

type EventSearchItemProps = {
  item: any;
  onSelect: (event: any) => void;
  eventItemBtnLabel?: string;
};

export default function EventSearchItem({ item, onSelect, eventItemBtnLabel = 'Buy Tickets' }: EventSearchItemProps) {
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
          xs: '.75fr 3fr',
          sm: '.75fr 3fr',
          md: '.75fr 1.2fr 3fr 1fr',
          lg: '.5fr .9fr 3.5fr 1fr',
          xl: '.5fr .9fr 3.5fr 1fr',
        },
        gap: 0,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.35s ease, background-color 0.35s ease',
      }}
      onClick={() => {
        onSelect(item);
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {/* Column 1: date segments – pill block, day emphasized, weekday strip (theme-aware, inverts in dark) */}
      <DateDisplay month={item.dateSegments.month} day={item.dateSegments.day} weekday={item.dateSegments.weekday} />
      {/* Column 2: event picture (fixed width) */}
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'none',
            md: 'flex',
            lg: 'flex',
            xl: 'flex',
          },
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        {item.image ? (
          <Box
            component="img"
            sx={{
              height: 92,
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
        justifyContent: 'flex-start',
      }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'oswald',
            fontSize: {
              xs: '14px', // max-width on extra-small screens
              sm: '14px', // max-width on small screens
              md: '18px', // max-width on medium screens
              lg: '21px', // max-width on large screens
              xl: '22px', // max-width on extra-large screens
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
              sm: '12px', // max-width on small screens
              md: '14px', // max-width on medium screens
              lg: '16px', // max-width on large screens
              xl: '16px', // max-width on extra-large screens
            },
          }}>
            {item.description}
        </Typography>

        <Button
          variant="contained"
          color={buttonColor}
          onClick={() => {
            onSelect(item);
          }}
          sx={(theme) => ({
            fontSize: '12px',
            transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
            padding: '.2rem .5rem',
            margin: 'auto 0 0 auto ',
            display: {
              xs: 'flex',
              sm: 'flex',
              md: 'none',
              lg: 'none',
              xl: 'none',
            },
          })}
        >
          {eventItemBtnLabel}{' '}
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
          onClick={() => {
            onSelect(item);
          }}
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
          {eventItemBtnLabel}{' '}
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
