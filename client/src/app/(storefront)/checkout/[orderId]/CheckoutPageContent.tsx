/**
 * Checkout page content component. Displays the content of the checkout page.
 *
 * @since buy-tickets--JP
 */
'use client';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { OrderWithTicketsType } from '../../../../lib/Types';
import { useMemo } from 'react';
import CheckoutForm from '../../../../components/CheckoutForm';
import CartTicket from '../../../../components/CartTicket';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { OrderStatusEnum } from '@bigtix/common';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import { formatReadableTime } from '../../../../lib/DateMethods';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { useCart } from '../../../../app/CartContext';

export type StripeElementsOptions = {
  mode: 'payment';
  amount: number;
  currency: string;
  appearance?: {
    theme?: 'night' | 'flat' | 'stripe';
  };
};

type CheckoutPageContentProps = {
  order?: OrderWithTicketsType | null;
  stripePublishableKey: string;
  stripeElementsOptions: StripeElementsOptions | null;
};

export default function CheckoutPageContent({
  order,
  stripePublishableKey,
  stripeElementsOptions,
}: CheckoutPageContentProps) {
  const router = useRouter();
  const theme = useTheme();
  const { removeFromCart } = useCart();
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey]
  );
  const [loaded, setLoaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const onSuccess = () => {
    // Officially remove the tickets from the cart
    order!.tickets.forEach((ticket) => removeFromCart(ticket.id));
    // Display success message
    setSuccess(true);
  };

  // Style the Stripe elements based on the current dark/light theme
  const stripeTheme = (theme.palette.mode === 'dark' ? 'night' : 'flat') as 'night' | 'flat' | 'stripe';
  const themedStripeElementsOptions = stripeElementsOptions ? {
    ...stripeElementsOptions,
    appearance: {
      theme: stripeTheme,
    },
  } : null;

  useEffect(() => {
    if (order && (order.status === OrderStatusEnum.AWAITING_PAYMENT || order.status === OrderStatusEnum.PAID)) {
      setSuccess(true);
    }
    setLoaded(true);
  }, [order]);

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
      { loaded && order && order.status !== OrderStatusEnum.EXPIRED && order.status !== OrderStatusEnum.CANCELLED && order.status !== OrderStatusEnum.FAILED && !success && (     
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          <Typography variant="h2" sx={{ mb: 2, fontFamily: 'oswald' }}>Checkout</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
            {/* Left column: expiry, payment */}
            <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoOutlineIcon sx={{ color: 'info.main', fontSize: 28 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Payment lock expires at {formatReadableTime(order.expiresAt)}
                </Typography>
              </Box>
              {stripePromise && themedStripeElementsOptions ? (
                <Elements stripe={stripePromise} options={themedStripeElementsOptions}>
                  <CheckoutForm orderId={order.id} amount={stripeElementsOptions?.amount ?? 0} onSuccess={onSuccess} />
                </Elements>
              ) : null}
            </Box>
            {/* Right column: order summary — top lines up with bottom of Checkout h2 */}
            <Box
              sx={{
                width: { xs: '100%', md: 360 },
                flexShrink: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="h2" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.5 }}>
                Order summary
              </Typography>
              {order.tickets.map((ticket) => (
                <CartTicket
                  key={ticket.id}
                  variant="summary"
                  ticket={{ id: ticket.id, title: ticket.title, price: ticket.price }}
                />
              ))}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 'auto' }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--mui-palette-success-main)' }}>
                    ${stripeElementsOptions?.amount ? (stripeElementsOptions.amount / 100).toFixed(2) : '0.00'}
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      { loaded && order && success && (
        <Box>
          <Typography variant="h2" sx={{ fontFamily: 'oswald', mb: 2 }}>Payment successful!</Typography>

          <Typography variant="h5">You will receive an email with a link to your tickets.</Typography>
          <Typography variant="h5">Thank you for your purchase!</Typography>
          <Button variant="contained" color="primary" onClick={() => router.push('/')} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Box>
      )}
      { loaded && order && (order.status === OrderStatusEnum.EXPIRED || order.status === OrderStatusEnum.CANCELLED || order.status === OrderStatusEnum.FAILED) && (
        <Box>
          <Typography variant="h2" sx={{ fontFamily: 'oswald', mb: 2 }}>Order {order.status}.</Typography>
          <Typography variant="h5">If you would like to try ordering tickets with a different payment method, please return to my tickets page and try again.</Typography>
          <Button variant="contained" color="primary" onClick={() => router.push('/tickets/mycart')} sx={{ mt: 2 }}>
            View Tickets My Cart
          </Button>
        </Box>
      )}
      { loaded && !order && (
        <Box>
          <Typography variant="h1">Order not found</Typography>
        </Box>
      )}
    </Container>
  );
}
