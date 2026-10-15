/**
 * Variant pricing helpers. The backend re-prices every line server-side
 * (`resolveLinePricing`); these mirror it for display only: a variant matching the
 * line's `volumeMl` wins, otherwise the product's top-level price applies.
 */
import type { Product, ProductVariant } from '@/types';

export const variantFor = (product: Product, volumeMl?: number): ProductVariant | undefined =>
  volumeMl === undefined ? undefined : product.variants?.find((v) => v.volumeMl === volumeMl);

/** First in-stock variant, else the first one; undefined for single-size products. */
export const defaultVariant = (product: Product): ProductVariant | undefined =>
  product.variants?.find((v) => v.inStock) ?? product.variants?.[0];

export const unitPrice = (product: Product, volumeMl?: number): number =>
  variantFor(product, volumeMl)?.price ?? product.price;
