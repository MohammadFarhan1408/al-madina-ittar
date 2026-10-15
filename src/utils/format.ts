/** Formatting helpers — single source of truth for prices, ratings, counts. */

import type { Money } from '@/types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'د.إ',
  USD: '$',
  SAR: '﷼',
  EUR: '€',
  GBP: '£',
};

export const formatPrice = (amount: Money, currency = 'AED'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${value}`;
};

export const formatRating = (rating: number): string => rating.toFixed(1);

export const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
};

export const formatVolume = (ml: number): string => `${ml} ml`;

export const calcDiscountPercent = (price: Money, original?: Money): number | null => {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
};

/** "2 Oct" — short day/month for order dates (falls back to the raw string if unparseable). */
export const formatShortDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AE', { day: 'numeric', month: 'short' });
};
