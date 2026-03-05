/**
 * My listings page content component. Displays the content of the my listings page.
 *
 * @since orders-page--JP
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import type { ListingType } from '../../../../lib/Types';
import { OrderStatusEnum } from '@bigtix/common';
import { API } from '../../../../lib/api/dicts/API';
import { APIError } from '@bigtix/common';
import TicketForm from '../../../../components/TicketForm';
import ListingCard from '../../../../components/ListingCard';

type MyListingsPageContentProps = {
  listings: ListingType[];
};

export default function MyListingsPageContent({ listings }: MyListingsPageContentProps) {
  const [tab, setTab] = useState(0);
  const [editingListing, setEditingListing] = useState<ListingType | null>(null);
  const router = useRouter();

  const forSale = listings.filter((l) => l.order == null || l.order.status === OrderStatusEnum.CREATED);
  const sold = listings.filter((l) => l.order != null && l.order.status === OrderStatusEnum.PAID);

  const openEditDialog = (listing: ListingType) => {
    setEditingListing(listing);
  };

  const closeEditDialog = () => {
    setEditingListing(null);
  };

  const handleSaveEdit = async (data: { title: string; priceCents: number; description: string }) => {
    if (!editingListing) return;
    try {
      await API.tick!.updateTicket!(editingListing.id, {
        title: data.title,
        price: data.priceCents,
        description: data.description,
      }, { credentials: 'include' });
      closeEditDialog();
      router.refresh();
    } catch (error) {
      throw new Error(error instanceof APIError ? error.errors.map((e) => e.message).join(', ') : 'Failed to update listing');
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
          xs: '375px',
          sm: '500px',
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
          <DialogContent sx={{ pt: 0 }}>
            <TicketForm
              isCreatingNew={false}
              initialTitle={editingListing?.title ?? ''}
              initialPriceCents={editingListing?.price ?? 0}
              initialDescription={editingListing?.description ?? ''}
              onSave={handleSaveEdit}
              onCancel={closeEditDialog}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}
