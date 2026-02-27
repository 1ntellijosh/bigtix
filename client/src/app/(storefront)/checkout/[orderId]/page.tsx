/**
 * Checkout page where a user can complete their purchagse for a given order
 *
 * @since buy-tickets--JP
 */
import Container from '@mui/material/Container';
import CheckoutPageContent from './CheckoutPageContent';
import { API } from '../../../../lib/api/dicts/API';
import { headers } from 'next/headers';
import type { OrderWithTicketsType } from '../../../../lib/Types';

export default async function CheckoutPage({ params }: { params: { orderId: string } }) {
  const { orderId } = await params;

  let ctxHeaders;
  let cookie;
  let host;

  let order: OrderWithTicketsType | null = null;
  try {
    ctxHeaders = await headers();
    cookie = ctxHeaders.get('cookie') ?? '';
    host = ctxHeaders.get('host') ?? '';
    const resp = await API.ord!.getOrderById!(orderId, {
      headers: { Cookie: cookie, Host: host },
    });
    order = (resp as unknown as OrderWithTicketsType) ?? null;
  } catch (e) {
    console.error('Error getting order', e);
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
  const stripeOptions =
    order?.tickets != null
      ? {
          mode: 'payment' as const,
          amount: order.tickets.reduce((sum, t) => sum + Math.round((t.price ?? 0)), 0),
          currency: 'usd',
        }
      : null;

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <CheckoutPageContent
        order={order ?? null}
        stripePublishableKey={publishableKey}
        stripeElementsOptions={stripeOptions}
      />
    </Container>
  );
}
