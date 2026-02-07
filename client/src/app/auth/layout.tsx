/**
 * Auth layout: no navbar. Shows banner when user is already signed in.
 *
 * @since  material-UI-sass--JP
 */
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import AuthSignedInBanner from './AuthSignedInBanner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <AuthSignedInBanner />
        {children}
      </Container>
    </Box>
  );
}
