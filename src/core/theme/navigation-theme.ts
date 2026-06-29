/**
 * Bridges our AppTheme to a React Navigation `Theme` so Expo Router's navigators
 * (headers, card backgrounds) match the brand palette.
 */
import { type ComponentProps } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { FontFamily } from '@/constants';
import type { AppTheme } from './theme';

/** The navigation theme shape accepted by expo-router's ThemeProvider. */
export type NavTheme = ComponentProps<typeof ThemeProvider>['value'];

export const toNavigationTheme = (theme: AppTheme): NavTheme => {
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme.isDark,
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text.primary,
      border: theme.colors.border,
      notification: theme.colors.error.base,
    },
    fonts: {
      regular: { fontFamily: FontFamily.body, fontWeight: '400' },
      medium: { fontFamily: FontFamily.bodyMedium, fontWeight: '500' },
      bold: { fontFamily: FontFamily.bodySemiBold, fontWeight: '600' },
      heavy: { fontFamily: FontFamily.bodyBold, fontWeight: '700' },
    },
  };
};
