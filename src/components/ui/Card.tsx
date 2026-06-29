/**
 * Card — elevated surface container with brand radius & shadow. Variants:
 *  - solid (default): themed surface
 *  - glass: frosted GlassSurface
 *  - gradient: subtle surface gradient
 * Optionally pressable (adds press-scale).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { Radius, type ShadowToken } from '@/constants';
import { useTheme } from '@/core/theme';
import { GlassSurface } from './GlassSurface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'solid' | 'glass' | 'gradient';

export type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  elevation?: ShadowToken;
  padded?: boolean;
  bordered?: boolean;
  radius?: number;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Card({
  children,
  variant = 'solid',
  elevation = 'sm',
  padded = true,
  bordered = false,
  radius = Radius.lg,
  onPress,
  style,
}: CardProps) {
  const { colors, shadows, spacing } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);

  const padding = padded ? spacing.lg : 0;
  const outer: ViewStyle = { borderRadius: radius, ...shadows[elevation] };

  const inner = (() => {
    if (variant === 'glass') {
      return (
        <GlassSurface radius={radius} style={{ padding }}>
          {children}
        </GlassSurface>
      );
    }
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={colors.surfaceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radius,
            padding,
            borderWidth: bordered ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          {children}
        </LinearGradient>
      );
    }
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius,
          padding,
          borderWidth: bordered ? 1 : 0,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    );
  })();

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[outer, animatedStyle, style]}
      >
        {inner}
      </AnimatedPressable>
    );
  }

  return <View style={[outer, style]}>{inner}</View>;
}
