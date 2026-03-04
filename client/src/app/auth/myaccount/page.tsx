/**
 * My account page where a user can view their account information and settings.
 *
 * @since buy-tickets--JP
 */
import Container from '@mui/material/Container';
import MyAccountPageContent from './MyAccountPageContent';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { API } from '../../../lib/api/dicts/API';

export default async function MyAccountPage() {
  let ctxHeaders;
  let cookie;
  let host;

  let currentUser: { id: string } | null = null;
  try {
    ctxHeaders = await headers();
    cookie = ctxHeaders.get('cookie') ?? '';
    host = ctxHeaders.get('host') ?? '';
    const authResp = await API.auth!.getCurrentUser!({
      headers: { Cookie: cookie, Host: host },
    });
    currentUser = (authResp as unknown as { currentUser?: { id: string } })?.currentUser ?? null;
  } catch (error) {
    console.error('Error getting current user', error);
  }

  if (!currentUser) {
    redirect('/auth/signin?redirect=/auth/myaccount');
  }

  return (
    <Container>
      <MyAccountPageContent />
    </Container>
  );
}