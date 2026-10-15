/**
 * Session store (persisted). `user`/`isAuthenticated` are cached here for instant UI on
 * launch; the tokens backing the session live in SecureStore (see token-storage.ts),
 * never in this AsyncStorage-persisted blob. `hydrateFromToken` re-validates against
 * the backend at app boot so a stale cached user can't outlive its token.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants';
import { authService } from '@/services';
import { setUnauthorizedHandler } from '@/services/api/client';
import { tokenStorage } from '@/services/api/token-storage';
import type { User } from '@/types';

type SessionState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: { fullName?: string; avatar?: string }) => Promise<void>;
  hydrateFromToken: () => Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrating: true,
      signIn: async (email, password) => {
        const { user, tokens } = await authService.signIn(email, password);
        await tokenStorage.setTokens(tokens);
        set({ user, isAuthenticated: true });
      },
      signUp: async (fullName, email, password) => {
        const { user, tokens } = await authService.signUp(fullName, email, password);
        await tokenStorage.setTokens(tokens);
        set({ user, isAuthenticated: true });
      },
      signOut: async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          await authService.signOut(refreshToken).catch(() => undefined);
        }
        await tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: async (input) => {
        const user = await authService.updateProfile(input);
        set({ user });
      },
      hydrateFromToken: async () => {
        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken || (await tokenStorage.isRefreshExpired())) {
          await tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isHydrating: false });
          return;
        }
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true, isHydrating: false });
        } catch {
          await tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isHydrating: false });
        }
      },
    }),
    {
      name: StorageKeys.authToken,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// Wired here (not in client.ts) to avoid a circular import between the store and the
// Axios client that the store's own auth calls go through.
setUnauthorizedHandler(() => {
  useSessionStore.setState({ user: null, isAuthenticated: false });
});
