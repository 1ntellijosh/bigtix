/**
 * Initial page for selling tickets. You search for an event that you want to sell tickets for. When you click on the
 * event, it will take you to the ticket creation page.
 *
 * @since create-tickets--JP
 */
import { redirect } from 'next/navigation';
import Container from '@mui/material/Container';
import SellPageContent from './SellPageContent';
import { API } from '../../../../lib/api/dicts/API';
import { headers } from 'next/headers';

export default async function SellPage() {
  let currentUser: { id: string } | null = null;
  try {
    const ctxHeaders = await headers();
    const cookie = ctxHeaders.get('cookie') ?? '';
    const host = ctxHeaders.get('host') ?? '';
    const resp = await API.auth!.getCurrentUser!({
      headers: { Cookie: cookie, Host: host },
    });
    currentUser = (resp as unknown as { currentUser?: { id: string } })?.currentUser ?? null;
  } catch (error) {
    console.error('Error getting current user', error);
  }
  if (!currentUser) {
    redirect('/auth/signin?redirect=/tickets/sell');
  }
  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <SellPageContent />
    </Container>
  );
}
