/**
 * My orders page content component. Displays the content of the my orders page.
 *
 * @since myorders-page--JP
 */
'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';
import type { OrderWithTicketsType } from '../../../../lib/Types';
import { OrderStatusEnum } from '@bigtix/common';
import { formatReadableTime } from '../../../../lib/DateMethods';

type MyOrdersPageContentProps = {
  orders: OrderWithTicketsType[];
};

const SHOWN_STATUSES = [
  OrderStatusEnum.CREATED,
  OrderStatusEnum.AWAITING_PAYMENT,
  OrderStatusEnum.PAID,
] as const;

function orderTotalCents(order: OrderWithTicketsType): number {
  return order.tickets.reduce((sum, t) => sum + (t.price ?? 0), 0);
}

function formatOrderDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyOrdersPageContent({ orders }: MyOrdersPageContentProps) {
  const [tab, setTab] = useState(0);

  const filtered = orders.filter((o) => SHOWN_STATUSES.includes(o.status as typeof SHOWN_STATUSES[number]));
  const currentOrders = filtered.filter(
    (o) => o.status === OrderStatusEnum.CREATED || o.status === OrderStatusEnum.AWAITING_PAYMENT
  );
  const pastOrders = filtered.filter((o) => o.status === OrderStatusEnum.PAID);

  return (
    <Container
      disableGutters
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '100vw',
        marginTop: 10
      }}
    >
      <Box sx={{
        my: 2,
        width: '100%',
        maxWidth: {
          xs: '375px',
          sm: '500px',
          md: '900px',
          lg: '1200px',
        },
      }}>
        <Typography variant="h3" sx={{ mb: 2, fontFamily: 'oswald' }}>
          My Orders
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, maxWidth: '850px' }}>
          <Tab label="Current" id="orders-tab-current" aria-controls="orders-panel-current" />
          <Tab label="Past" id="orders-tab-past" aria-controls="orders-panel-past" />
        </Tabs>

        {tab === 0 && (
          <Box id="orders-panel-current" role="tabpanel" aria-labelledby="orders-tab-current" sx={{ maxWidth: '850px' }}>
            {currentOrders.length === 0 ? (
              <Typography color="text.secondary">No current orders.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showExpiry />
                ))}
              </Box>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box id="orders-panel-past" role="tabpanel" aria-labelledby="orders-tab-past" sx={{ maxWidth: '850px' }}>
            {pastOrders.length === 0 ? (
              <Typography color="text.secondary">No past orders.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showExpiry={false} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
}

function OrderCard({
  order,
  showExpiry,
}: {
  order: OrderWithTicketsType;
  showExpiry: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalCents = orderTotalCents(order);
  const dateLabel = showExpiry ? 'Expires' : 'Paid';
  const dateValue = !mounted
    ? '--'
    : showExpiry
      ? `${formatOrderDate(order.expiresAt)} ${formatReadableTime(order.expiresAt)}`
      : formatOrderDate(order.expiresAt);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 1,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Order {order.id.slice(-8)}
        </Typography>
        {order.status === OrderStatusEnum.CREATED && (
        <MuiLink component={NextLink} href={`/checkout/${order.id}`} underline="hover" sx={{ fontWeight: 500 }}>
            Pay now
          </MuiLink>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
        {order.tickets.map((ticket) => (
          <Typography key={ticket.id} variant="body2" color="text.secondary">
            {ticket.title} — ${typeof ticket.price === 'number' ? (ticket.price / 100).toFixed(2) : '0.00'}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          {dateLabel}: {dateValue}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          Total: ${(totalCents / 100).toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}
