/**
 * My tickets page where a user can view their tickets (cart) and proceed to checkout.
 *
 * @since my-tickets--JP
 */
'use client';

import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import LockClockIcon from '@mui/icons-material/LockClock';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../../app/CartContext';
import { API } from '../../../../lib/api/dicts/API';
import { LS_KEYS, LocalStore } from '../../../../lib/localstorage/LocalStore';
import type { SavedTicketDoc } from '../../../../../../tickets-srv/src/models/Ticket';
import type { SavedOrderDoc } from '../../../../../../orders-srv/src/models/Order';
import { formatReadableTime } from '../../../../lib/DateMethods';

/** expiresAt is ISO date string for comparison; use formatReadableTime() for display */
type OrdersReservedRecord = Record<string, { orderId: string; expiresAt: string }>;

/**
 * Looks up orders reserved in local storage and returns them as a record to show on the my tickets page
 *
 * @returns {OrdersReservedRecord} - orders reserved record
 */
function readOrdersReserved(): OrdersReservedRecord {
  if (typeof window === 'undefined') return {};
  try {
    const raw = LocalStore.getItem(LS_KEYS.ORDERS_RESERVED);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    const orders = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as OrdersReservedRecord) : {};
    const now = new Date();
    const stillValid = Object.fromEntries(
      Object.entries(orders).filter(([, v]) => v?.expiresAt && new Date(v.expiresAt) > now)
    );
    if (Object.keys(stillValid).length !== Object.keys(orders).length) {
      writeOrdersReserved(stillValid);
    }
    return stillValid;
  } catch {
    return {};
  }
}

/**
 * Writes orders reserved to local storage
 *
 * @param {OrdersReservedRecord} orders - orders reserved record
 */
function writeOrdersReserved(orders: OrdersReservedRecord): void {
  try {
    LocalStore.setItem(LS_KEYS.ORDERS_RESERVED, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

type OrderCreatedResponse = {
  order: SavedOrderDoc;
  tickets: SavedTicketDoc[];
  unavailableTickets: { id: string; price: number }[];
  ticketsNotFound: { id: string; price: number }[];
};

export default function MyTicketsPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [unavailableDialogOpen, setUnavailableDialogOpen] = useState(false);
  const [unavailableDialogContent, setUnavailableDialogContent] = useState<{
    removedTitles: string[];
    reservedCount: number;
  } | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [allUnavailableDialogOpen, setAllUnavailableDialogOpen] = useState(false);
  const [reservedOrderId, setReservedOrderId] = useState<string | null>(null);
  const [ticketsOnOrder, setTicketsOnOrder] = useState<OrdersReservedRecord>({});

  useEffect(() => {
    // Split list of tickets in local storage cart into inCartTickets and reservedTickets to show on page in two lists
    setTicketsOnOrder(readOrdersReserved());
  }, []);

  const inCartTickets = cartItems.filter((t) => !ticketsOnOrder[t.id]);
  const reservedTickets = cartItems.filter((t) => ticketsOnOrder[t.id]);
  const inCartSubtotal = inCartTickets.reduce((sum, t) => sum + (t.price ?? 0), 0);
  const inCartCount = inCartTickets.length;

  /**
   * Proceeds to checkout by creating an order and reserving tickets that are present in the "In Cart" list
   *
   * @returns {Promise<void>}
   */
  const onProceedToCheckout = async () => {
    try {
      const body = (await API.ord!.createOrderAndReserveTickets!({
        tickets: inCartTickets.map((t) => ({ id: t.id, price: t.price })),
      })) as unknown as OrderCreatedResponse;
      handleOrderCreated(body);
    } catch (e) {
      if (e instanceof Error && e.message === 'All tickets are unavailable') {
        clearCart();
        setAllUnavailableDialogOpen(true);
      } else {
        console.error('Failed to create order', e);
      }
    }
  };

  /**
   * Handles the response from the order creation API call. Updates the local storage with the new order and tickets
   * reserved with its expiration time.
   *
   * @param {OrderCreatedResponse} resp - order creation response
   * @returns {void}
   */
  const handleOrderCreated = (resp: OrderCreatedResponse) => {
    const removedIds = new Set<string>();
    const removedTitles: string[] = [];

    [...resp.unavailableTickets, ...resp.ticketsNotFound].forEach(({ id }) => {
      removedIds.add(id);
      const cartItem = cartItems.find((t) => t.id === id);
      removedTitles.push(cartItem?.title ?? `Ticket`);
    });

    removedIds.forEach((id) => removeFromCart(id));

    const ordersr = readOrdersReserved();
    const expiresAtIso =
      resp.order.expiresAt != null ? new Date(resp.order.expiresAt).toISOString() : '';
    resp.tickets.forEach((t) => {
      ordersr[t.id] = { orderId: resp.order.id, expiresAt: expiresAtIso };
    });
    writeOrdersReserved(ordersr);
    setTicketsOnOrder(ordersr);

    setReservedOrderId(resp.order.id);

    if (resp.unavailableTickets.length > 0 || resp.ticketsNotFound.length > 0) {
      setUnavailableDialogContent({
        removedTitles: removedTitles.length ? removedTitles : ['Some tickets'],
        reservedCount: resp.tickets.length,
      });
      setUnavailableDialogOpen(true);
    } else {
      setSuccessDialogOpen(true);
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tickets reserved</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            All your tickets have been successfully reserved. You have 15 minutes to complete your purchase, or they will be put back on sale.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              if (reservedOrderId) router.push(`/checkout/${reservedOrderId}`);
            }}
            color="primary"
            variant="contained"
          >
            Proceed to checkout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={allUnavailableDialogOpen} onClose={() => setAllUnavailableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>All tickets unavailable</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            All the tickets you selected are unavailable (e.g. already locked by another order). No order was made. Please try different tickets or try again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllUnavailableDialogOpen(false)} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={unavailableDialogOpen} onClose={() => setUnavailableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Some tickets unavailable</DialogTitle>
        <DialogContent>
          {unavailableDialogContent && (
            <>
              <Typography variant="body1" sx={{ mb: 1 }}>
                The following tickets are already locked by someone else&apos;s order and have been removed from your cart:
              </Typography>
              <Box component="ul" sx={{ pl: 2, my: 1 }}>
                {unavailableDialogContent.removedTitles.map((title, i) => (
                  <Typography key={i} component="li" variant="body2">
                    {title}
                  </Typography>
                ))}
              </Box>
              <Typography variant="body1">
                An order for the remaining {unavailableDialogContent.reservedCount} ticket(s) is reserved. You have 15 minutes to complete your purchase or they will go back on sale.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUnavailableDialogOpen(false);
              if (reservedOrderId) router.push(`/checkout/${reservedOrderId}`);
            }}
            color="primary"
            variant="contained"
          >
            Proceed to checkout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Title */}
      <Typography variant="h3" sx={{ mb: 0.5, fontFamily: 'oswald' }}>
        My Tickets
      </Typography>

      {/* In Cart: ticket list (left) and subtotal/checkout (right) */}
      <Typography variant="h5" sx={{ mt: 2, mb: 0.5, fontFamily: 'oswald' }}>
        In Cart
      </Typography>
      <Typography
        component="button"
        variant="body2"
        onClick={() => inCartTickets.forEach((t) => removeFromCart(t.id))}
        sx={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'primary.main',
          textDecoration: 'none',
          font: 'inherit',
          mb: 1,
          display: 'block',
          '&:hover': { color: 'primary.dark', textDecoration: 'underline' },
        }}
      >
        Clear tickets from cart
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, width: '100%' }}>
            {inCartTickets.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '18px', fontWeight: 500 }}>
                No tickets in your cart
              </Typography>
            ) : (
              inCartTickets.map((ticket) => (
                <Box
                  key={ticket.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 80,
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, pr: 1 }}>
                      {ticket.title}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                      ${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : '0.00'}
                    </Typography>
                  </Box>
                  {ticket.description ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {ticket.description}
                    </Typography>
                  ) : null}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeFromCart(ticket.id)}
                      aria-label="Remove from cart"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right column: subtotal and checkout (for In Cart only) */}
        <Box
          sx={{
            mt: 1,
            width: { xs: '100%', md: 320 },
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            position: { xs: 'fixed', md: 'sticky' },
            top: { xs: 'auto', md: 24 },
            bottom: { xs: '50px', md: 'auto' },
            left: { xs: 0, md: 'auto' },
            minHeight: { xs: '100px', md: 'auto' },
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Subtotal ({inCartCount} {inCartCount === 1 ? 'item' : 'items'}): ${inCartSubtotal.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={inCartCount === 0}
            sx={{ position: { xs: 'fixed', md: 'sticky' }, bottom: { xs: '50px', md: 'auto' }, left: { xs: 0, md: 'auto' } }}
            onClick={() => onProceedToCheckout()}
          >
            Proceed to checkout
          </Button>
        </Box>
      </Box>

      {/* Reserved for purchase: no right column */}
      <Typography variant="h5" sx={{ mt: 4, mb: 1, fontFamily: 'oswald' }}>
        Reserved for purchase
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {reservedTickets.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '18px', fontWeight: 500 }}>
              No tickets reserved
            </Typography>
          ) : (
            reservedTickets.map((ticket) => (
              <Box
                key={ticket.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 80,
                  width: {
                    xs: '100%',
                    md: 'calc(100% - 320px)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, pr: 1 }}>
                    {ticket.title}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">
                    ${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : '0.00'}
                  </Typography>
                </Box>
                {ticket.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {ticket.description}
                  </Typography>
                ) : null}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                  <Button
                    component={Link}
                    href={`/checkout/${ticketsOnOrder[ticket.id]?.orderId ?? ''}`}
                    variant="outlined"
                    color="success"
                    size="small"
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&:hover': { borderColor: 'success.dark', color: 'success.dark' },
                    }}
                  >
                    <Typography component="span" variant="body2" sx={{ color: 'inherit', fontWeight: 'inherit' }}>
                      Reserved for purchase until {formatReadableTime(ticketsOnOrder[ticket.id]?.expiresAt) ?? ''}
                    </Typography>
                    <LockClockIcon sx={{ color: 'inherit', fontSize: 18, ml: 0.5 }} />
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
}
