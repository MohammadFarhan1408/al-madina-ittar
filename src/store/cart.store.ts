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

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),
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
      clear: () => set({ items: [] }),
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
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
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
