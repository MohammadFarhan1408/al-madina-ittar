/** Loader — branded activity indicator, inline or full-screen centered. */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

export type LoaderProps = {
  size?: 'small' | 'large';
  fullscreen?: boolean;
  color?: string;
};

export function Loader({ size = 'large', fullscreen = false, color }: LoaderProps) {
  const { colors } = useTheme();
  const indicator = <ActivityIndicator size={size} color={color ?? colors.accent} />;

  if (!fullscreen) return indicator;

  return (
    <View style={[styles.fullscreen, { backgroundColor: colors.background }]}>
      {indicator}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
