import type { ID } from './common';

export type User = {
  id: ID;
  fullName: string;
  email: string;
  avatar?: string;
  memberSince: string;
  /** Loyalty tier for the premium experience. */
  tier: 'Guest' | 'Member' | 'Connoisseur' | 'Maison Elite';
  role: 'user' | 'manager' | 'admin';
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserPreferences = {
  themeMode: 'light' | 'dark' | 'system';
  promosEnabled: boolean;
  orderUpdatesEnabled: boolean;
  currency: string;
  language: string;
};
