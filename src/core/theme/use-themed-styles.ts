/**
 * Creates a memoized, theme-aware StyleSheet. Cuts the boilerplate of threading
 * the theme into every component's styles.
 *
 * Usage:
 *   const styles = useThemedStyles((t) => ({
 *     card: { backgroundColor: t.colors.surface, padding: t.spacing.lg },
 *   }));
 */
import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from './use-theme';
import type { AppTheme } from './theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: AppTheme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
