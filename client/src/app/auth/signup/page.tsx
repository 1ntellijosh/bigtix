/**
 * Regular user sign up page
 *
 * @since ticketmaster-api--JP
 */
import Container from '@mui/material/Container';
import SignUpPageContent from './SignUpPageContent';

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect = '' } = await searchParams;

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <SignUpPageContent postSignupRedirect={redirect} />
    </Container>
  );
}
