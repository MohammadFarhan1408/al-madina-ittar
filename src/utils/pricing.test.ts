import type { Product } from '@/types';
import { defaultVariant, unitPrice } from './pricing';

const product = {
  price: 100,
  volumeMl: 12,
  variants: [
    { volumeMl: 3, price: 40, inStock: false },
    { volumeMl: 12, price: 100, inStock: true },
    { volumeMl: 50, price: 300, inStock: true },
  ],
} as unknown as Product;

describe('pricing', () => {
  it('prices a line by its variant', () => {
    expect(unitPrice(product, 50)).toBe(300);
  });
  it('falls back to the product price for unknown or missing size', () => {
    expect(unitPrice(product, 99)).toBe(100);
    expect(unitPrice(product)).toBe(100);
  });
  it('defaults to the first in-stock variant', () => {
    expect(defaultVariant(product)?.volumeMl).toBe(12);
    expect(defaultVariant({ ...product, variants: undefined } as Product)).toBeUndefined();
  });
});
