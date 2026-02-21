/**
 * Tickets form component, used for creating tickets
 *
 * @since create-tickets--JP
 */
import { useState } from 'react';
import { API } from '../lib/api/dicts/API';
import type { SavedEventDoc } from '../../../../../tickets-srv/src/models/Event'; 
import FormSubmit from '../hooks/FormSubmit';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ThemedButton from './ThemedButton';


export default function TicketsForm({event, onSuccessfulCreate}: {event: SavedEventDoc, onSuccessfulCreate: () => void}) {
  const theme = useTheme();
  const [eventName, setEventName] = useState(event.title);
  const [eventId, setEventId] = useState(event.id);
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [ticketSerialNumbers, setTicketSerialNumbers] = useState<string[]>([]);
  const [doneEnteringSerialNumbers, setDoneEnteringSerialNumbers] = useState(false);
  const [tempTicketPriceInput, setTempTicketPriceInput] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketDescription, setTicketDescription] = useState('');
  const [bottomMessage, setBottomMessage] = useState('');
  const [descriptionDone, setDescriptionDone] = useState(false);

  const { errors, submitForm, submitMutation } = FormSubmit(
    () => API.tick!.createTickets!({ title: eventName, price: ticketPrice, description: ticketDescription, serialNumbers: ticketSerialNumbers, eventId: eventId }),
    { title: eventName, price: ticketPrice, description: ticketDescription, serialNumbers: ticketSerialNumbers, eventId: eventId },
    onSuccessfulCreate,
  );

  /**
   * Sets the ticket quantity, used to set the ticket quantity when the ticket quantity is updated.
   *
   * @param {number} quantity  The quantity of the ticket
   *
   * @returns {void}
   */
  const onSetTicketQuantity = (quantity: number) => {
    setTicketQuantity(quantity);
    setTicketSerialNumbers(new Array(quantity).fill(''));
  }

  /**
   * Updates the serial number field, used to update the serial number field when the serial number field is updated.
   *
   * @param {number} index  The index of the serial number field
   * @param {string} value  The value of the serial number field
   *
   * @returns {void}
   */
  const onUpdateSerialNumberField = (index: number, value: string) => {
    const newSerialNumbers = [...ticketSerialNumbers];
    newSerialNumbers[index] = value;
    setTicketSerialNumbers(newSerialNumbers);
  }

  /**
   * Checks and validates the serial numbers, if the serial numbers are not unique or empty, set the bottom message.
   * Otherwise, sets the done entering serial numbers state to true.
   *
   * @returns {void}
   */
  const onDoneWithSerialNumbers = () => {
    const sMap: Record<string, boolean> = {};
    for (const serialNumber of ticketSerialNumbers) {
      const trimmedSerialNumber = serialNumber.trim();
      if (trimmedSerialNumber === '' || sMap[trimmedSerialNumber]) {
        setBottomMessage('Serial numbers must be unique, and cannot be empty.');

        return;
      }
      sMap[trimmedSerialNumber] = true;
    }
    setDoneEnteringSerialNumbers(true);
    setBottomMessage('');
  }

  /**
   * Resets the serial numbers, used to reset the serial numbers when the serial numbers are updated.
   *
   * @returns {void}
   */
  const onResetSerialNumbers = () => {
    setTicketQuantity(0);
    setTicketSerialNumbers([]);
    setDoneEnteringSerialNumbers(false);
    setBottomMessage('');
  }

  /**
   * Updates the temporary ticket price input, used to update the temporary ticket price input when the temporary ticket price input is updated.
   *
   * @param {string} value  The value of the temporary ticket price input
   *
   * @returns {void}
   */
  const onUpdateTempTicketPrice = (value: string) => {
    setTempTicketPriceInput(value);
    setPriceError(null);
  };

  /**
   * Checks and validates the temporary ticket price input, if the price is not a number, set the price error.
   * Otherwise, sets the ticket price.
   *
   * @returns {void}
   */
  const trySetTicketPrice = () => {
    const trimmed = tempTicketPriceInput.trim();
    if (trimmed === '') {
      setPriceError('Price must be a number');

      return;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      setPriceError('Price must be a number');

      return;
    }

    const validatedPrice = parseFloat(trimmed).toFixed(2).toString();
    setTicketPrice(parseFloat(validatedPrice));
    setPriceError(null);
  };

  /**
   * Resets the description done state, used to reset the description done state when the description is updated.
   *
   * @returns {void}
   */
  const onResetDescription = () => {
    setDescriptionDone(false);
  }

  /**
   * Box shadow for the tickets form, dark mode is different from light mode
   *
   * @type {string}
   */
  const boxShadow = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return 'none';
      }

      return '0 3px 6px 0 rgba(0, 0, 0, 0.2)';
    },
    [theme.palette.mode]
  );

  /**
   * Background color for the search item, dark mode is different from light mode
   *
   * @type {string}
   */
  const backgroundColor = useMemo(
    () => {
      if (theme.palette.mode === 'dark') {
        return alpha(theme.palette.common.white, 0.1);
      }

      return '#ffffff';
    },
    [theme]
  );

  return (
    <Box
      sx={{
        boxShadow: boxShadow,
        bgcolor: backgroundColor,
        padding: 3,
        borderRadius: 3,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <Box component="form" onSubmit={submitForm}>
        {!doneEnteringSerialNumbers ? (
          <FormControl fullWidth>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 1 }}>Enter Ticket Quantity:</Typography>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={ticketQuantity}
              onChange={(e) => onSetTicketQuantity(Number(e.target.value))}
            >
              <MenuItem value={1}>One</MenuItem>
              <MenuItem value={2}>Two</MenuItem>
              <MenuItem value={3}>Three</MenuItem>
              <MenuItem value={4}>Four</MenuItem>
              <MenuItem value={5}>Five</MenuItem>
              <MenuItem value={6}>Six</MenuItem>
              <MenuItem value={7}>Seven</MenuItem>
              <MenuItem value={8}>Eight</MenuItem>
              <MenuItem value={9}>Nine</MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
            </Select>
          </FormControl>
        ) : ( null )}

        {!doneEnteringSerialNumbers && ticketQuantity > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 3 }}>
            <FormControl fullWidth>
              <Typography component="h3" sx={{ fontSize: '20px', mb: 1 }}>Enter Ticket Serial Numbers:</Typography>

              {ticketSerialNumbers.map((serialNumber, index) => (
                <TextField
                  key={index}
                  label="Serial Number"
                  type="text"
                  placeholder="Enter serial number"
                  value={serialNumber}
                  onChange={(e) => onUpdateSerialNumberField(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onDoneWithSerialNumbers();
                    }
                  }}
                />
              ))}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                <ThemedButton onClicked={() => onDoneWithSerialNumbers()}>
                  Done!
                </ThemedButton>
              </Box>
            </FormControl>
          </Box>
        ) : ( null )}

        {doneEnteringSerialNumbers ? (
          <Box sx={{ mb: 3 }}>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 0 }}>Tickets:</Typography>
            <Box sx={{ borderBottom: '1px solid #ccc', borderRadius: 1, p: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <List>
                {ticketSerialNumbers.map((serialNumber, index) => (
                  <ListItem key={index} disablePadding sx={{ pl: 0 }}>
                    <ListItemText primary={`${index + 1}. ${serialNumber}`} />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mb: 2 }}>
                <ThemedButton onClicked={() => onResetSerialNumbers()}>Re-enter ticket quantity</ThemedButton>
              </Box>
            </Box>
          </Box>
        ) : ( null )}

        {doneEnteringSerialNumbers && ticketPrice === 0 ? (
          <FormControl fullWidth error={!!priceError}>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 1 }}>Enter Ticket Price:</Typography>
            <TextField
              variant="outlined"
              value={tempTicketPriceInput}
              onChange={(e) => onUpdateTempTicketPrice(e.target.value)}
              error={
                priceError !== null ||
                (tempTicketPriceInput.trim() !== '' && Number.isNaN(Number(tempTicketPriceInput.trim())))
              }
              helperText={priceError != null ? priceError : undefined}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  trySetTicketPrice();
                }
              }}
              placeholder="0.00"
              fullWidth
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
              <ThemedButton onClicked={() => trySetTicketPrice()}>Set Ticket Price</ThemedButton>
            </Box>
          </FormControl>
        ) : ( null)}

        {doneEnteringSerialNumbers && ticketPrice > 0 ? (
          <Box sx={{ borderBottom: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pb: 3, mb: 3 }}>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 0 }}>Ticket(s) Price: ${ticketPrice}</Typography>
            <ThemedButton onClicked={() => setTicketPrice(0)}>
              Update Price
            </ThemedButton>
          </Box>
        ) : ( null)}

        {doneEnteringSerialNumbers && ticketPrice > 0 && !descriptionDone ? (
          <FormControl fullWidth>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 1 }}>Enter Ticket Description:</Typography>
            <TextField
              type="text"
              placeholder="Enter description"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDescriptionDone(true);
                }
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
              <ThemedButton onClicked={() => setDescriptionDone(true)}>Done!</ThemedButton>
            </Box>
          </FormControl>
        ) : ( null )}

        {doneEnteringSerialNumbers && ticketPrice > 0 && descriptionDone ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'start', gap: 2 }}>
            <Typography component="h3" sx={{ fontSize: '20px', mb: 0 }}>Ticket Description:</Typography>
            <Typography component="h5">{ticketDescription}</Typography>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 3, borderBottom: '1px solid #ccc', mb: 1 }}>
              <ThemedButton onClicked={() => onResetDescription()}>
                Update Description
              </ThemedButton>
            </Box>

            <Box>
              <ThemedButton onClicked={() => submitForm()} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Creating tickets..." : "Create Tickets"}
              </ThemedButton>
            </Box>
          </Box>
        ) : ( null )}

        <Box>
          {bottomMessage && <Typography variant="body1">{bottomMessage}</Typography>}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {errors}
        </Box>
      </Box>
    </Box>
  );
}
