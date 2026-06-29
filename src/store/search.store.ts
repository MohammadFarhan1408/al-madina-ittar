/**
 * Search store (persisted) — recent search terms (most-recent first, capped).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants';

const MAX_RECENT = 8;

type SearchState = {
  recent: string[];
  addRecent: (term: string) => void;
  removeRecent: (term: string) => void;
  clearRecent: () => void;
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (term) =>
        set((state) => {
          const clean = term.trim();
          if (!clean) return state;
          const next = [clean, ...state.recent.filter((t) => t.toLowerCase() !== clean.toLowerCase())];
          return { recent: next.slice(0, MAX_RECENT) };
        }),
      removeRecent: (term) =>
        set((state) => ({ recent: state.recent.filter((t) => t !== term) })),
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: StorageKeys.recentSearches,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
