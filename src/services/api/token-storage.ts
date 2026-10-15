/**
 * Access/refresh token pair, kept out of AsyncStorage (unencrypted) since the refresh
 * token is a 30-day bearer-equivalent secret.
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'al_madina_access_token';
const REFRESH_KEY = 'al_madina_refresh_token';
const REFRESH_EXP_KEY = 'al_madina_refresh_expires_at';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  /** ISO timestamp after which the refresh token (and so the session) is dead. */
  refreshExpiresAt?: string;
};

export const tokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setTokens(tokens: TokenPair) {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
    if (tokens.refreshExpiresAt) {
      await SecureStore.setItemAsync(REFRESH_EXP_KEY, tokens.refreshExpiresAt);
    }
  },
  async isRefreshExpired() {
    const at = await SecureStore.getItemAsync(REFRESH_EXP_KEY);
    return Boolean(at && new Date(at).getTime() <= Date.now());
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(REFRESH_EXP_KEY);
  },
};
