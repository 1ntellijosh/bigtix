/**
 * Checkout form component, used for creating a checkout form
 *
 * @since buy-tickets--JP
 */
'use client';
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { API } from '../lib/api/dicts/API';
import Button from '@mui/material/Button';
import { PaymentStatusEnum } from '@bigtix/common';
import { APIError } from '@bigtix/common';
import Box from '@mui/material/Box';

export default function CheckoutForm({ orderId, amount, onSuccess }: { orderId: string, amount: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setErrorMessage(null); // Clear previous errors

    const { error: submitError } = await elements.submit();

    if (submitError) return setErrorMessage(submitError.message ?? 'Please fill out all fields for payment');

    // 1. Create ConfirmationToken from Elements
    const { error: tokenError, confirmationToken } = await stripe.createConfirmationToken({ elements });

    if (tokenError) return setErrorMessage(tokenError.message ?? "We're having trouble connecting to payment provider. Please try again.");

    try {
      // 2. Send token to Server Action
      const response = await API.pay!.finalizePaymentOnServer!({
        orderId,
        amount,
        confirmationTokenId: confirmationToken.id,
      }) as unknown as { status: string, clientSecret: string };

      // 3. HANDLE SERVER RESPONSE STATUSES
      handleServerResponseStatuses(response.status, response.clientSecret);
    } catch (error) {
      setErrorMessage(
        error instanceof APIError
          ? error.errors.map((err) => err.message).join(', ')
          : 'We\'re having trouble processing your payment. Please try again.');
    }
  };

  const handleServerResponseStatuses = async (status: string, clientSecret: string | null) => {
    if (status === PaymentStatusEnum.REQUIRES_ACTION) {
      // 3D Secure Popup Needed (Stripe requires further action required by the user)
      const { error: nextActionError, paymentIntent } = await stripe!.handleNextAction({
        clientSecret: clientSecret ?? '',
      });

      if (nextActionError) {
        setErrorMessage(nextActionError.message ?? "We're having trouble processing your payment. Please try again.");

        return;
      }
      
      // Payment successful, redirect to success page
      if (paymentIntent!.status === PaymentStatusEnum.SUCCESS) {
        onSuccess();

        return;
      }

      setErrorMessage("We're having trouble processing your payment. Please try again.");
      
      return;
    }
    
    // Payment Failed (Declined, Insufficient Funds, etc.) The user stays on page to fix their details or use new card.
    if (status === PaymentStatusEnum.REQUIRES_PAYMENT_METHOD) {
      setErrorMessage("Your payment was declined. Please try a different payment method.");
      
      return;
    }
    
    // Immediate Success
    if (status === PaymentStatusEnum.SUCCESS) {
      onSuccess();
    }
  };

  return (
    <Box sx={{ width: '100%', margin: '0 auto' }}>
      <Box component="form" onSubmit={handleSubmit}>
        <PaymentElement />
        {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
        <Button sx={{ mt: 3 }} type="submit" variant="contained" color="primary" disabled={!stripe}>Pay Now</Button>
      </Box>
    </Box>
  );
}