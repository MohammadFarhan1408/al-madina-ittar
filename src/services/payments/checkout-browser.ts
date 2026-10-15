/**
 * Stripe Checkout hand-off. The backend creates the hosted session when the order is
 * placed (or a payment is retried) and exposes it as `metadata.checkoutUrl` on the
 * transaction; its success/cancel URLs point at the web storefront, so there is no
 * automatic return to the app. We open it in the in-app browser and, once the customer
 * closes it, callers refetch the order — the Stripe webhook settles the payment.
 */
import * as WebBrowser from 'expo-web-browser';

import type { Transaction } from '@/types';
import { paymentsService } from './payments.service';

/** Newest transaction that carries a Stripe Checkout URL, if any. */
export const latestCheckoutUrl = (transactions: Transaction[]): string | undefined =>
  [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .find((t) => t.metadata?.checkoutUrl)?.metadata?.checkoutUrl;

export const openCheckoutUrl = async (url: string) => {
  await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: 'close' });
};

/** Opens the order's Stripe Checkout if it has one; resolves false when there is none. */
export async function openStripeCheckoutForOrder(orderId: string, guestEmail?: string) {
  const url = latestCheckoutUrl(await paymentsService.getForOrder(orderId, guestEmail));
  if (!url) return false;
  await openCheckoutUrl(url);
  return true;
}
