/**
 * Card displaying a single ticket listing (title, price, description) with optional edit and order info.
 *
 * @since orders-page--JP
 */
'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { ListingType } from '../lib/Types';
import { OrderStatusEnum } from '@bigtix/common';
import { formatReadableTime } from '../lib/DateMethods';

function formatListingDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type ListingCardProps = {
  listing: ListingType;
  showOrderInfo?: boolean;
  showForSaleActions?: boolean;
  onEditClick?: (listing: ListingType) => void;
  children?: React.ReactNode;
};

export default function ListingCard({
  listing,
  showOrderInfo = false,
  showForSaleActions = false,
  onEditClick,
  children,
}: ListingCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLocked = listing.order != null && listing.order.status === OrderStatusEnum.CREATED;
  const showEdit = listing.order == null;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          {listing.title}
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} color="primary">
          ${typeof listing.price === 'number' ? (listing.price / 100).toFixed(2) : '0.00'}
        </Typography>
      </Box>
      {listing.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: showOrderInfo || showForSaleActions ? 1 : 0 }}>
          {listing.description}
        </Typography>
      ) : null}
      {showForSaleActions && (showEdit || isLocked) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {showEdit && (
            <Button onClick={() => onEditClick?.(listing)} variant="outlined" size="small">
              Edit
            </Button>
          )}
          {children}
          {isLocked && listing.order && (
            <Typography variant="body2" color="text.secondary">
              Locked for order payment. Expires: {mounted ? `${formatListingDate(listing.order.expiresAt)} ${formatReadableTime(listing.order.expiresAt)}` : '--'}
            </Typography>
          )}
        </Box>
      )}
      {showOrderInfo && listing.order && (
        <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Order {listing.order.id.slice(-8)} · Sold: {formatListingDate(listing.order.expiresAt)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
