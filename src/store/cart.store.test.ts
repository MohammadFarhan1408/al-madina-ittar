import type { Product } from '@/types';
import { computeCartSummary, useCartStore } from './cart.store';

const product = (id: string, price: number, variants?: Product['variants']) =>
  ({ id, price, variants, currency: 'AED' }) as unknown as Product;

describe('cart', () => {
  beforeEach(() => useCartStore.getState().clear());

  it('applies free shipping from 250 AED, else flat 20', () => {
    expect(computeCartSummary([{ product: product('a', 249), quantity: 1 }]).shipping).toBe(20);
    expect(computeCartSummary([{ product: product('a', 250), quantity: 1 }]).shipping).toBe(0);
  });

  it('prices lines by selected size', () => {
    const p = product('a', 100, [{ volumeMl: 50, price: 300, inStock: true }]);
    expect(computeCartSummary([{ product: p, quantity: 2, volumeMl: 50 }]).subtotal).toBe(600);
  });

  it('replaces the line when a different size is added, merges when same', () => {
    const p = product('a', 100);
    const { addItem } = useCartStore.getState();
    expect(addItem(p, 1, 12)).toBe('added');
    expect(addItem(p, 2, 12)).toBe('added');
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(addItem(p, 1, 50)).toBe('replaced');
    expect(useCartStore.getState().items).toEqual([{ product: p, quantity: 1, volumeMl: 50 }]);
  });

  it('clear() drops the coupon too', () => {
    useCartStore.getState().setCoupon('WELCOME10');
    useCartStore.getState().clear();
    expect(useCartStore.getState().couponCode).toBeNull();
  });
});
