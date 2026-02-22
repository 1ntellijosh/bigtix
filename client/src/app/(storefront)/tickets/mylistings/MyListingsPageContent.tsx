/**
 * My listings page content component. Displays the content of the my listings page.
 *
 * @since orders-page--JP
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import type { ListingType } from '../../../../lib/Types';
import { OrderStatusEnum } from '@bigtix/common';
import { formatReadableTime } from '../../../../lib/DateMethods';
import { API } from '../../../../lib/api/dicts/API';
import { APIError } from '@bigtix/common';

type MyListingsPageContentProps = {
  listings: ListingType[];
};

function formatListingDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyListingsPageContent({ listings }: MyListingsPageContentProps) {
  const [tab, setTab] = useState(0);
  const [editingListing, setEditingListing] = useState<ListingType | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriceError, setEditPriceError] = useState<string | null>(null);
  const [editDescriptionError, setEditDescriptionError] = useState<string | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const router = useRouter();

  const forSale = listings.filter((l) => l.order == null || l.order.status === OrderStatusEnum.CREATED);
  const sold = listings.filter((l) => l.order != null && l.order.status === OrderStatusEnum.PAID);

  const openEditDialog = (listing: ListingType) => {
    setEditingListing(listing);
    setEditPriceInput(typeof listing.price === 'number' ? (listing.price / 100).toFixed(2) : '0.00');
    setEditDescription(listing.description ?? '');
    setEditPriceError(null);
    setEditDescriptionError(null);
    setEditSubmitError(null);
  };

  const closeEditDialog = () => {
    setEditingListing(null);
    setEditPriceError(null);
    setEditDescriptionError(null);
    setEditSubmitError(null);
  };

  const validateAndGetPriceDollars = (): number | null => {
    const trimmed = editPriceInput.trim();
    if (trimmed === '') {
      setEditPriceError('Price must be a number');
      return null;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      setEditPriceError('Price must be a number');
      return null;
    }
    const validatedPrice = parseFloat(trimmed).toFixed(2);
    const priceNum = parseFloat(validatedPrice);
    if (priceNum < 10) {
      setEditPriceError('Price must be at least $10');
      return null;
    }
    setEditPriceError(null);
    return priceNum;
  };

  const handleSaveEdit = async () => {
    if (!editingListing) return;
    const priceDollars = validateAndGetPriceDollars();
    if (priceDollars == null) return;
    const description = editDescription.trim() || (editingListing.description ?? '');
    if (!description) {
      setEditDescriptionError('Description is required');
      return;
    }
    setEditDescriptionError(null);
    setEditSubmitError(null);
    setEditSaving(true);
    try {
      const res = await API.tick!.updateTicket!(editingListing.id, {
        title: editingListing.title,
        price: Math.round(priceDollars * 100),
        description,
      }, { credentials: 'include' });

      closeEditDialog();
      router.refresh();
    } catch (error) {
      setEditSubmitError(error instanceof APIError ? error.errors.map((e) => e.message).join(', ') : 'Failed to update listing');
    } finally {
      setEditSaving(false);
    }
  };

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
          xs: '450px',
          sm: '450px',
          md: '900px',
          lg: '1200px',
        },
      }}>
        <Typography variant="h3" sx={{ mb: 0.5, fontFamily: 'oswald' }}>
          My Listings
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          View your listings and manage them.
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, maxWidth: '850px' }}>
          <Tab label="For Sale" id="listings-tab-forsale" aria-controls="listings-panel-forsale" />
          <Tab label="Sold" id="listings-tab-sold" aria-controls="listings-panel-sold" />
        </Tabs>

        {tab === 0 && (
          <Box id="listings-panel-forsale" role="tabpanel" aria-labelledby="listings-tab-forsale" sx={{ maxWidth: '850px' }}>
            {forSale.length === 0 ? (
              <Typography color="text.secondary">No listings for sale.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {forSale.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showForSaleActions onEditClick={openEditDialog} />
                ))}
              </Box>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box id="listings-panel-sold" role="tabpanel" aria-labelledby="listings-tab-sold" sx={{ maxWidth: '850px' }}>
            {sold.length === 0 ? (
              <Typography color="text.secondary">No sold listings.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sold.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showOrderInfo />
                ))}
              </Box>
            )}
          </Box>
        )}

        <Dialog open={editingListing != null} onClose={closeEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
            <TextField
              label="Title"
              value={editingListing?.title ?? ''}
              disabled
              fullWidth
              size="small"
            />
            <FormControl fullWidth error={!!editPriceError}>
              <TextField
                label="Price"
                value={editPriceInput}
                onChange={(e) => { setEditPriceInput(e.target.value); setEditPriceError(null); }}
                onBlur={() => {
                  const trimmed = editPriceInput.trim();
                  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
                    setEditPriceInput(parseFloat(trimmed).toFixed(2));
                  }
                }}
                size="small"
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                helperText={editPriceError}
              />
            </FormControl>
            <TextField
              label="Description"
              value={editDescription}
              onChange={(e) => { setEditDescription(e.target.value); setEditDescriptionError(null); }}
              error={!!editDescriptionError}
              helperText={editDescriptionError}
              multiline
              minRows={2}
              fullWidth
              size="small"
            />
            {editSubmitError && (
              <Typography color="error" variant="body2">{editSubmitError}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog} disabled={editSaving}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

function ListingCard({
  listing,
  showOrderInfo = false,
  showForSaleActions = false,
  onEditClick,
}: {
  listing: ListingType;
  showOrderInfo?: boolean;
  showForSaleActions?: boolean;
  onEditClick?: (listing: ListingType) => void;
}) {
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
