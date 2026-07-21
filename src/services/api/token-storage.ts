/**
 * Access/refresh token pair, kept out of AsyncStorage (unencrypted) since the refresh
 * token is a 30-day bearer-equivalent secret.
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'al_madina_access_token';
const REFRESH_KEY = 'al_madina_refresh_token';

export type TokenPair = { accessToken: string; refreshToken: string };

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
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};
