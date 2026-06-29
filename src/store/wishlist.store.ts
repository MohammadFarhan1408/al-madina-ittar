/**
 * Wishlist store (persisted). Stores product IDs only; product details come from cache.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants';

type WishlistState = {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      add: (productId) =>
        set((state) =>
          state.ids.includes(productId) ? state : { ids: [...state.ids, productId] },
        ),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
      has: (productId) => get().ids.includes(productId),
    }),
    {
      name: StorageKeys.wishlist,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const selectWishlistCount = (state: WishlistState): number => state.ids.length;

/** Reactive membership check for a single product. */
export const useIsWishlisted = (productId: string): boolean =>
  useWishlistStore((state) => state.ids.includes(productId));
