/**
 * Home page (storefront)
 *
 * @since material-UI-sass--JP
 */
'use client';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppLink from '../../components/AppLink';
import { useCurrentUser } from '../CurrentUserContext';

export default function Home() {
  const { currentUser } = useCurrentUser();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Current User: {currentUser?.email || 'Not logged in'}
        </Typography>

        <AppLink href="/auth/signin" color="secondary">
          Go to the sign in page
        </AppLink>

        <AppLink href="/auth/signup" color="secondary">
          Go to the sign up page
        </AppLink>
      </Box>
    </Container>
  );
}
