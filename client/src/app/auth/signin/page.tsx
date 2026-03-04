/**
 * Regular user sign in page
 *
 * @since ticketmaster-api--JP
 */
import Container from '@mui/material/Container';
import SignInPageContent from './SignInPageContent';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect = '' } = await searchParams;

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <SignInPageContent postSigninRedirect={redirect} />
    </Container>
  );
}
