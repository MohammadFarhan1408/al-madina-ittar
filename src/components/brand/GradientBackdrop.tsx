/**
 * GradientBackdrop — the luxe layered base used behind most screens: a theme gradient
 * with an optional Art Deco pattern wash. Renders as an absolute fill; place first in a
 * container and lay content on top.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme';
import { ArtDecoPattern } from './ArtDecoPattern';

export type GradientVariant = 'noir' | 'surface' | 'gold' | 'emerald' | 'hero';

export type GradientBackdropProps = {
  variant?: GradientVariant;
  pattern?: boolean;
  patternOpacity?: number;
  style?: ViewStyle;
};

export function GradientBackdrop({
  variant = 'noir',
  pattern = false,
  patternOpacity,
  style,
}: GradientBackdropProps) {
  const { colors } = useTheme();

  const gradients: Record<GradientVariant, readonly [string, string, ...string[]]> = {
    noir: colors.noirGradient,
    surface: colors.surfaceGradient,
    gold: colors.goldGradient,
    emerald: colors.emeraldGradient,
    hero: colors.heroGradient,
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {pattern ? <ArtDecoPattern opacity={patternOpacity} /> : null}
    </LinearGradient>
  );
}
