/**
 * App-wide configuration. Reads from Expo public env vars where available, with
 * sensible defaults. `dataSource: 'mock'` keeps the app fully runnable with no backend;
 * flip to 'remote' (and set apiBaseUrl) when a real API exists.
 */
import Constants from 'expo-constants';

type DataSource = 'mock' | 'remote';

const env = process.env;

export const AppConfig = {
  name: 'Al Madina',
  tagline: 'The Art of Arabian Perfumery',
  defaultCurrency: 'AED',
  dataSource: (env.EXPO_PUBLIC_DATA_SOURCE as DataSource) ?? 'mock',
  apiBaseUrl: env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.almadina.example/v1',
  apiTimeoutMs: 15000,
  version: Constants.expoConfig?.version ?? '1.0.0',
  freeShippingThreshold: 250,
  flatShippingFee: 20,
} as const;

export type AppConfigType = typeof AppConfig;
