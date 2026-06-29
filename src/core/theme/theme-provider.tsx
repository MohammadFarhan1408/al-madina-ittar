/**
 * ThemeProvider: resolves the active scheme from a persisted user preference
 * ('light' | 'dark' | 'system') layered over the OS color scheme, and exposes the
 * composed `AppTheme` plus controls to change it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { StorageKeys } from '@/constants';
import type { ColorSchemeName } from '@/theme/types';
import { getTheme, type AppTheme } from './theme';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: AppTheme;
  scheme: ColorSchemeName;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const resolveScheme = (
  preference: ThemePreference,
  system: ColorSchemeName,
): ColorSchemeName => (preference === 'system' ? system : preference);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ColorSchemeName =
    useSystemColorScheme() === 'dark' ? 'dark' : 'light';
  // Dark-first brand default ("Midnight Oud"); user can switch to light/system in Settings.
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');

  // Hydrate persisted preference once.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(StorageKeys.themePreference).then((stored) => {
      if (active && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setPreferenceState(stored);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(StorageKeys.themePreference, next);
  }, []);

  const scheme = resolveScheme(preference, systemScheme);

  const toggle = useCallback(() => {
    setPreference(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: getTheme(scheme), scheme, preference, setPreference, toggle }),
    [scheme, preference, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
