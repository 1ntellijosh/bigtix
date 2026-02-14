/**
 * Home page (storefront)
 *
 * @since material-UI-sass--JP
 */
'use client';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCurrentUser } from '../CurrentUserContext';
import EventSearch from '../../components/EventSearch';

export default function Home() {
  const { currentUser } = useCurrentUser();

  return (
    <Container maxWidth="lg" disableGutters>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" component="h2" sx={{ mb: 2, fontSize: '56px', fontWeight: 400 }}>
        <span style={{ fontSize: '57.5px' }}>B</span>ig<span style={{ marginLeft: '-4px', fontSize: '57.5px' }}>T</span>ix

          <Typography variant="body2" component="p" sx={{ fontSize: '17px', ml: '71px', mt: '-14px' }}>Buy and sell tickets to events</Typography>
        </Typography>

        <Box sx={{
          my: 2,
          width: '100%',
          // Set a max-width that increases at specific breakpoints
          maxWidth: {
            xs: '500px', // max-width on extra-small screens
            md: '900px', // max-width on medium screens
            lg: '1200px', // max-width on large screens
          },
        }}>
          <EventSearch />
        </Box>
      </Box>
    </Container>
  );
}
