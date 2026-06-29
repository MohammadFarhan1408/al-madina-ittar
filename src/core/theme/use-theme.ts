import { useContext } from 'react';

import { ThemeContext } from './theme-provider';
import type { AppTheme } from './theme';

/** Access the full active theme (colors + tokens + shadows). */
export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx.theme;
}

/** Access theme preference controls (settings screens, theme toggles). */
export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeControls must be used within <ThemeProvider>');
  }
  const { scheme, preference, setPreference, toggle } = ctx;
  return { scheme, preference, setPreference, toggle };
}
