/**
 * My listings page where a user can view their listings and manage them.
 *
 * @since orders-page--JP
 */
import { redirect } from 'next/navigation';
import Container from '@mui/material/Container';
import MyListingsPageContent from './MyListingsPageContent';
import { API } from '../../../../lib/api/dicts/API';
import { headers } from 'next/headers';
import type { SavedTicketDoc, ListingType } from '../../../../lib/Types';
import { OrderStatusEnum } from '@bigtix/common';

export default async function MyListingsPage() {
  let tickets: SavedTicketDoc[] | null = null;
  let listings: ListingType[] = [];
  let currentUser: { id: string } | null = null;
  try {
    const ctxHeaders = await headers();
    const cookie = ctxHeaders.get('cookie') ?? '';
    const host = ctxHeaders.get('host') ?? '';
    const resp = await API.auth!.getCurrentUser!({
      headers: { Cookie: cookie, Host: host },
    });
    currentUser = (resp as unknown as { currentUser?: { id: string } })?.currentUser ?? null;

    if (currentUser) {
      const tickResp = await API.tick!.getTicketsByUserId!(currentUser.id, {
        headers: { Cookie: cookie, Host: host },
      });
      tickets = (tickResp as unknown as SavedTicketDoc[]) ?? null;
  
      const ticketList = tickets ?? [];
      for (const ticket of ticketList) {
        let order: { id: string; status: OrderStatusEnum; expiresAt: Date } | null = null;
        if (ticket.orderId) {
          const orderResp = await API.ord!.getOrderSafeDetailsById!(ticket.orderId, {
            headers: { Cookie: cookie, Host: host },
          });
          order = (orderResp as unknown as { id: string; status: OrderStatusEnum; expiresAt: Date }) ?? null;
        }
        const t = ticket as SavedTicketDoc & { description?: string };
        listings.push({
          id: t.id,
          title: t.title,
          ...(t.description != null && { description: t.description }),
          price: t.price,
          order,
        });
      }
    }
  } catch (error) {
    console.error('Error getting listings', error);
  }

  if (!currentUser) { 
    redirect('/auth/signin?redirect=/tickets/mylistings');
  }

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <MyListingsPageContent listings={listings ?? []} />
    </Container>
  );
}
