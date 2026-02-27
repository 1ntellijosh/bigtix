/**
 * Instantiates Stripe Library instance
 *
 * @since payments-srv-start--JP
 */
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Stripe SDK types use a literal for the latest API version; that literal changes with each SDK release.
  // Assert so we compile with any stripe version (local may be 2026-01-28, CI may resolve to 2026-02-25).
  apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  typescript: true,
});
