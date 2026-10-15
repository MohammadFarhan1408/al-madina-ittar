/**
 * Cart store (persisted). Holds line items only; monetary totals are derived via
 * selectors so we never store stale computed state.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppConfig } from '@/core/config';
import { StorageKeys } from '@/constants';
import type { CartItem, CartSummary, Product } from '@/types';
import { unitPrice } from '@/utils/pricing';

type CartState = {
  items: CartItem[];
  /** Applied coupon code (re-validated server-side against the live subtotal). */
  couponCode: string | null;
  setCoupon: (code: string | null) => void;
  /**
   * The backend cart holds one line per product, so adding a different size replaces
   * the existing line; returns 'replaced' in that case so the UI can say so.
   */
  addItem: (product: Product, quantity?: number, volumeMl?: number) => 'added' | 'replaced';
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      setCoupon: (couponCode) => set({ couponCode }),
      addItem: (product, quantity = 1, volumeMl) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing && existing.volumeMl !== volumeMl) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id ? { product, quantity, volumeMl } : i,
            ),
          }));
          return 'replaced';
        }
        set((state) => ({
          items: existing
            ? state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              )
            : [...state.items, { product, quantity, volumeMl }],
        }));
        return 'added';
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i,
                ),
        })),
      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        })),
      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [], couponCode: null }),
    }),
    {
      name: StorageKeys.cart,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Derived total item count (sum of quantities). Returns a primitive — safe as a selector. */
export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/**
 * Pure derivation of the monetary summary from cart items.
 *
 * IMPORTANT: never pass this (or any object-returning selector) directly to
 * `useCartStore(...)`. Under Zustand v5 the store snapshot is compared with
 * `Object.is`, and a selector that builds a fresh object every call yields a new
 * reference each render → `useSyncExternalStore` sees the snapshot perpetually change
 * → infinite re-render ("Maximum update depth exceeded"). Consume via `useCartSummary`.
 */
export const computeCartSummary = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((sum, i) => sum + unitPrice(i.product, i.volumeMl) * i.quantity, 0);
  const shipping =
    subtotal === 0 || subtotal >= AppConfig.freeShippingThreshold
      ? 0
      : AppConfig.flatShippingFee;
  return {
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: AppConfig.defaultCurrency,
  };
};

/**
 * Subscribe to the cart summary safely. Selects only the stable `items` array reference
 * (which changes solely when the cart mutates) and memoizes the derived object, so the
 * component re-renders and recomputes only when items actually change.
 */
export const useCartSummary = (): CartSummary => {
  const items = useCartStore((state) => state.items);
  return useMemo(() => computeCartSummary(items), [items]);
};
