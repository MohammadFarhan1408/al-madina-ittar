/**
 * Screen — base page container. Applies background, safe-area insets and optional
 * horizontal padding. Use on every route for consistent framing.
 */
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Layout } from '@/constants';
import { useTheme } from '@/core/theme';

export type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
  edges?: readonly Edge[];
  backgroundColor?: string;
  style?: ViewStyle;
};

export function Screen({
  children,
  padded = false,
  edges = ['top'],
  backgroundColor,
  style,
}: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: backgroundColor ?? colors.background }]}
    >
      <View
        style={[styles.inner, padded && { paddingHorizontal: Layout.screenPadding }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
});
