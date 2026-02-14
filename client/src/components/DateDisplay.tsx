/**
 * Date display component. Displays a date in a readable format.
 *
 * @since ticketmaster-api--JP
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type DateProps = {
  month: string;
  day: number;
  weekday: string;
};

export default function DateDisplay({ month, day, weekday }: DateProps) {
  return (<Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121212' : 'grey.300'),
      maxWidth: {
        xs: '70px',
        sm: '70px',
        md: '75px',
        lg: '80px',
        xl: '80px',
      },
      minWidth: {
        xs: '70px',
        sm: '70px',
        md: '75px',
        lg: '80px',
        xl: '80px',
      },
      maxHeight: {
        xs: '80px',
        sm: '80px',
        md: '84px',
        lg: '92px',
        xl: '92px',
      },
      minHeight: {
        xs: '80px',
        sm: '80px',
        md: '84px',
        lg: '92px',
        xl: '92px',
      },
    }}
  >
    <Box
      sx={{
        py: {
          xs: 0.5,
          sm: 0.5,
          md: 0.6,
          lg: 0.6,
          xl: 0.6,
        },
        px: {
          xs: 1.2,
          sm: 1.2,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: {
            xs: '11px',
            sm: '11px',
            md: '12px',
            lg: '13px',
            xl: '13px',
          },
          color: (theme) => (theme.palette.mode === 'dark' ? 'grey.200' : 'grey.700'),
        }}
      >
        {month}
      </Typography>

      <Typography
        component="span"
        sx={{
          fontSize: {
            xs: '1.5rem',
            sm: '1.5rem',
            md: '1.7rem',
            lg: '1.9rem',
            xl: '1.9rem',
          },
          fontWeight: 800,
          lineHeight: 1.1,
          color: (theme) => (theme.palette.mode === 'dark' ? 'grey.100' : 'grey.800'),
        }}
      >
        {day}
      </Typography>
    </Box>

    <Box
      sx={{
        py: {
          xs: 0.5,
          sm: 0.5,
          md: 0.6,
          lg: 0.6,
          xl: 0.6,
        },
        px: {
          xs: 1.2,
          sm: 1.2,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
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
        {weekday}
      </Typography>
    </Box>
  </Box>);
}