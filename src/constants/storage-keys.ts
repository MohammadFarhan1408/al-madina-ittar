/**
 * AsyncStorage keys. Namespaced to avoid collisions across the app.
 */
const NS = '@al_madina';

export const StorageKeys = {
  cart: `${NS}/cart`,
  wishlist: `${NS}/wishlist`,
  themePreference: `${NS}/theme`,
  onboardingComplete: `${NS}/onboarding`,
  authToken: `${NS}/auth_token`,
  recentSearches: `${NS}/recent_searches`,
} as const;

export type StorageKey = keyof typeof StorageKeys;
