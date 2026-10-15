/**
 * Stripe Checkout hand-off. The backend creates the hosted session when the order is
 * placed (or a payment is retried) and exposes it as `metadata.checkoutUrl` on the
 * transaction. We send the app's own deep link (`paymentReturnUrl`) as the return URL
 * when placing/retrying, so Stripe redirects back into the app and the auth session
 * closes by itself. Callers then refetch the order — the Stripe webhook settles the
 * payment, not this redirect.
 */
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { Transaction } from '@/types';
import { paymentsService } from './payments.service';

/** Newest transaction that carries a Stripe Checkout URL, if any. */
export const latestCheckoutUrl = (transactions: Transaction[]): string | undefined =>
  [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .find((t) => t.metadata?.checkoutUrl)?.metadata?.checkoutUrl;

/** Deep link Stripe returns to (`almadinaittar://payment-return`, or `exp://…` in Expo Go). */
export const paymentReturnUrl = () => Linking.createURL('payment-return');

/** Resolves when the customer returns via the deep link or dismisses the sheet. */
export const openCheckoutUrl = async (url: string) => {
  await WebBrowser.openAuthSessionAsync(url, paymentReturnUrl());
};

/** Opens the order's Stripe Checkout if it has one; resolves false when there is none. */
export async function openStripeCheckoutForOrder(orderId: string, guestEmail?: string) {
  const url = latestCheckoutUrl(await paymentsService.getForOrder(orderId, guestEmail));
  if (!url) return false;
  await openCheckoutUrl(url);
  return true;
}
