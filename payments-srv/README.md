# Stripe API Dev Notes:

## The Final "Web Checkout" Flow

| Step |	Location |	Action | |
|------|-----------|---------|-|
| 1	| Client | User reaches checkout. You initialize elements (no client_secret needed yet). |  |
| 2	| Client | User enters card info and clicks "Pay". You call stripe.confirmPayment with handleActions: false. |  |
| 3	| Stripe | (SDK)	Stripe validates the card and returns a ConfirmationToken (ct_...). |  |
| 4	| Client | You send that ct_... ID to your server via a standard fetch or axios POST. |  |
| 5	| Server | Your server calls Stripe to Create and Confirm the PaymentIntent in one go. | X |
| 6	| Server | **Partial Fulfillment**: Record order as "Pending". Send client_secret back if 3DS is needed. | X |
| 7	| Client | (If needed) The browser shows the bank's "Verify your identity" popup. |  |
| 8 | Stripe | 	(Webhook) Stripe sends payment_intent.succeeded once payment is fully cleared. | X |
| 9. | Server | **Final Fulfillment**: Webhook handler updates order status to "Completed" in your DB. | X |

### TODO: Client-Side Setup (Setup Elements in `./client`)
On your checkout page, you initialize Stripe Elements without a client_secret.

```
// components/CheckoutForm.js
'use client';
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { finalizePaymentOnServer } from '@/app/actions';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setErrorMessage(null); // Clear previous errors

    // 1. Create ConfirmationToken from Elements
    const { error: tokenError, confirmationToken } = await stripe.createConfirmationToken({ elements });
    if (tokenError) return setErrorMessage(tokenError.message);

    // 2. Send token to Server Action
    const response = await finalizePaymentOnServer(confirmationToken.id);

    // 3. HANDLE SERVER RESPONSE STATUSES
    if (response.status === 'requires_action') {
      // CASE: 3D Secure Popup Needed
      const { error: nextActionError, paymentIntent } = await stripe.handleNextAction({
        clientSecret: response.clientSecret,
      });

      if (nextActionError) {
        setErrorMessage(nextActionError.message);
      } else if (paymentIntent.status === 'succeeded') {
        window.location.href = '/success';
      }
      
    } else if (response.status === 'requires_payment_method') {
      // CASE: Payment Failed (Declined, Insufficient Funds, etc.)
      // The user stays on the page to fix their details or use a new card.
      setErrorMessage("Your payment was declined. Please try a different payment method.");
      
    } else if (response.status === 'succeeded') {
      // CASE: Immediate Success
      window.location.href = '/success';
      
    } else if (response.error) {
      // CASE: Technical/API Error
      setErrorMessage(response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
      <button type="submit" disabled={!stripe}>Pay Now</button>
    </form>
  );
}
```

### Status returns from Stripe api

| Status from Server | Meaning | Action Required |
|--------------------|---------|-----------------|
| succeeded |	Payment complete | Fulfill order. |
| requires_action |	3D Secure needed | Send client_secret to client; call handleNextAction. |
| requires_payment_method |	Payment failed | Ask user for a different card. |

### 3D Secure Test Card Numbers

Use the following card details in your Stripe Elements form to simulate 3DS authentication: 

| Scenario | Card Number |
|----------|-------------|
| Always Require 3DS |4000 0027 6000 3184 |
| Standard 3DS (One-time) |	4000 0027 6000 3155 |
| International 3DS	| 4000 0000 0000 3184 |

  - Expiration Date: Any date in the future (e.g., 12/30).
  - CVC: Any 3-digit code (e.g., 123). 



