/**
 * Single ticket card used in "In cart" and "Reserved for purchase" sections on My Tickets.
 *
 * @since buy-tickets--JP
 */
'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import LockClockIcon from '@mui/icons-material/LockClock';
import Link from 'next/link';

export type CartTicketItem = {
  id: string;
  title: string;
  price?: number;
  description?: string;
};

type CartTicketCartProps = {
  variant: 'cart';
  ticket: CartTicketItem;
  onRemove: (ticketId: string) => void;
};

type CartTicketReservedProps = {
  variant: 'reserved';
  ticket: CartTicketItem;
  orderId: string;
  expiresAtDisplay: string;
};

type CartTicketSummaryProps = {
  variant: 'summary';
  ticket: CartTicketItem;
};

export type CartTicketProps = CartTicketCartProps | CartTicketReservedProps | CartTicketSummaryProps;

export default function CartTicket(props: CartTicketProps) {
  const { ticket, variant } = props;
  const isReserved = variant === 'reserved';
  const isSummary = variant === 'summary';

  const rootWidth = isReserved
    ? { xs: '100%' as const, md: 'calc(100% - 320px)' as const }
    : '100%';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 80,
        width: rootWidth,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, pr: 1 }}>
          {ticket.title}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          ${typeof ticket.price === 'number' ? (ticket.price / 100).toFixed(2) : '0.00'}
        </Typography>
      </Box>
      {ticket.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {ticket.description}
        </Typography>
      ) : null}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
        {isSummary ? null : isReserved ? (
          <Button
            component={Link}
            href={`/checkout/${props.orderId}`}
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
              Reserved for purchase until {props.expiresAtDisplay}
            </Typography>
            <LockClockIcon sx={{ color: 'inherit', fontSize: 18, ml: 0.5 }} />
          </Button>
        ) : (
          <IconButton
            color="error"
            size="small"
            onClick={() => props.onRemove(ticket.id)}
            aria-label="Remove from cart"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
