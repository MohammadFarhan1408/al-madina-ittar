/**
 * GlassSurface — frosted "liquid glass" container with a safe cross-platform fallback:
 *   1. iOS 26+  → native expo-glass-effect GlassView (true liquid glass)
 *   2. else      → expo-blur BlurView (frosted blur)
 *   3. SSR/web   → translucent token surface
 * Always overlays a hairline gold border for the couture edge.
 */
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants';
import { useTheme } from '@/core/theme';
import { isWeb } from '@/core/platform';

export type GlassSurfaceProps = {
  children?: ReactNode;
  radius?: number;
  intensity?: number;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

const liquidGlass = (() => {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

export function GlassSurface({
  children,
  radius = Radius.lg,
  intensity = 40,
  bordered = true,
  style,
}: GlassSurfaceProps) {
  const { colors, isDark } = useTheme();
  const border = bordered
    ? { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.glassBorder }
    : null;
  const shape: ViewStyle = { borderRadius: radius, overflow: 'hidden' };

  if (liquidGlass) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        style={[shape, border, style]}
      >
        {children}
      </GlassView>
    );
  }

  if (!isWeb) {
    return (
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[shape, border, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[shape, border, { backgroundColor: colors.glassTint }, style]}>{children}</View>
  );
}
