/**
 * Form for editing or creating a ticket listing (title, price, description).
 * Use inside a Dialog (e.g. My Listings) or inline (e.g. Sell page). No Dialog wrapper.
 *
 * @since create-tickets--JP
 */
'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const MIN_PRICE_DOLLARS = 10;

export type TicketFormData = {
  title: string;
  priceCents: number;
  description: string;
  serialNumber?: string;
};

export type TicketFormProps = {
  /** When false, editing an existing listing (title read-only). When true, creating new (title editable for sell page). */
  isCreatingNew: boolean;
  /** Initial title (read-only when editing; initial value when creating). */
  initialTitle: string;
  /** Initial price in cents. */
  initialPriceCents: number;
  /** Initial description. */
  initialDescription: string;
  /** Initial serial number. */
  initialSerialNumber?: string;
  /** Called with form data on Save. Parent performs API call (update or create) and closes dialog if needed. */
  onSave: (data: TicketFormData) => Promise<void>;
  /** Called when Cancel is clicked. Parent should close dialog or cancel flow. */
  onCancel: () => void;
};

function centsToPriceInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function TicketForm({
  isCreatingNew,
  initialTitle,
  initialPriceCents,
  initialDescription,
  initialSerialNumber,
  onSave,
  onCancel,
}: TicketFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priceInput, setPriceInput] = useState(centsToPriceInput(initialPriceCents));
  const [description, setDescription] = useState(initialDescription);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [serialNumberError, setSerialNumberError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync form state when initial values change (e.g. parent opens dialog with different listing)
  useEffect(() => {
    setTitle(initialTitle);
    setPriceInput(centsToPriceInput(initialPriceCents));
    setDescription(initialDescription);
    setSerialNumber(initialSerialNumber ?? '');
    setPriceError(null);
    setDescriptionError(null);
    setSubmitError(null);
  }, [initialTitle, initialPriceCents, initialDescription]);

  const validateAndGetPriceDollars = (): number | null => {
    const trimmed = priceInput.trim();
    if (trimmed === '') {
      setPriceError('Price must be a number');
      return null;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      setPriceError('Price must be a number');
      return null;
    }
    const validatedPrice = parseFloat(trimmed).toFixed(2);
    const priceNum = parseFloat(validatedPrice);
    if (priceNum < MIN_PRICE_DOLLARS) {
      setPriceError(`Price must be at least $${MIN_PRICE_DOLLARS}`);
      return null;
    }
    setPriceError(null);
    return priceNum;
  };

  const handleSave = async () => {
    const priceDollars = validateAndGetPriceDollars();
    if (priceDollars == null) return;
    const descTrimmed = description.trim();
    if (!descTrimmed) {
      setDescriptionError('Description is required');
      return;
    }
    setDescriptionError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      const data: TicketFormData = {
        title: isCreatingNew ? title.trim() : initialTitle,
        priceCents: Math.round(priceDollars * 100),
        description: descTrimmed,
        ...(isCreatingNew && { serialNumber }),
      };
      await onSave(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {isCreatingNew && <TextField
          label="Serial Number"
          value={serialNumber}
          onChange={(e) => {
            setSerialNumber(e.target.value);
            setSerialNumberError(null);
          }}
          error={!!serialNumberError}
          helperText={serialNumberError}
          fullWidth
          size="small"
        />}
        <FormControl fullWidth error={!!priceError}>
          <TextField
            label="Price"
            value={priceInput}
            onChange={(e) => {
              setPriceInput(e.target.value);
              setPriceError(null);
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              const trimmed = priceInput.trim();
              if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
                setPriceInput(parseFloat(trimmed).toFixed(2));
              }
            }}
            size="small"
            fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
            helperText={priceError}
          />
        </FormControl>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionError(null);
          }}
          error={!!descriptionError}
          helperText={descriptionError}
          multiline
          minRows={2}
          fullWidth
          size="small"
        />
        {submitError && (
          <Typography color="error" variant="body2">
            {submitError}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>
    </>
  );
}
