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
        {month}
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
        {day}
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
        {weekday}
      </Typography>
    </Box>
  </Box>);
}