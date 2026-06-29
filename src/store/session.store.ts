/**
 * Session store (persisted) — mock/local auth. `signIn`/`signUp` synthesize a User and
 * mark the session authenticated; no backend. Swap the bodies for real API calls later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants';
import type { User } from '@/types';

type SessionState = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string) => void;
  signUp: (fullName: string, email: string) => void;
  signOut: () => void;
};

const makeUser = (fullName: string, email: string): User => ({
  id: `u-${Date.now()}`,
  fullName,
  email,
  memberSince: new Date().toISOString().slice(0, 10),
  tier: 'Member',
});

const nameFromEmail = (email: string) => {
  const handle = email.split('@')[0] ?? 'Guest';
  return handle
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      signIn: (email) =>
        set({ user: makeUser(nameFromEmail(email), email), isAuthenticated: true }),
      signUp: (fullName, email) =>
        set({ user: makeUser(fullName, email), isAuthenticated: true }),
      signOut: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: StorageKeys.authToken,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
