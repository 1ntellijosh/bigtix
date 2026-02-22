/**
 * My orders page where a user can view their orders and manage them.
 *
 * @since orders-page--JP
 */
import Container from '@mui/material/Container';
import MyOrdersPageContent from './MyOrdersPageContent';
import { API } from '../../../../lib/api/dicts/API';
import { headers } from 'next/headers';
import type { OrderWithTicketsType } from '../../../../lib/Types';
import { redirect } from 'next/navigation';

export default async function MyOrdersPage() {
  let ctxHeaders;
  let cookie;
  let host;

  let orders: OrderWithTicketsType[] | null = null;
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
    redirect('/auth/signin');
  }

  try {
    ctxHeaders = await headers();
    cookie = ctxHeaders.get('cookie') ?? '';
    host = ctxHeaders.get('host') ?? '';
    const resp = await API.ord!.getAllOrders!({
      headers: { Cookie: cookie, Host: host },
    });
    orders = (resp as unknown as OrderWithTicketsType[]) ?? null;
  } catch (error) {
    console.error('error getting orders', error);
  }

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <MyOrdersPageContent orders={orders ?? []} />
    </Container>
  );
}
