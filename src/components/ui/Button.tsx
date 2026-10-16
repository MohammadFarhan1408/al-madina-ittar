/**
 * Button — the brand control.
 *
 * Variants (hierarchy, strongest first):
 *  - primary   solid ivory on dark / ink on light. The default CTA on every screen.
 *  - gradient  brushed-gold metal. Reserved for the ONE moment that matters most in a
 *              flow (hero, proceed to checkout, order confirmed). Kept for API compat.
 *  - secondary tonal surface fill — a quieter alternative to primary.
 *  - outline   hairline control border, primary text.
 *  - ghost     text only (inline actions like "Remove").
 *
 * Square-ish couture geometry, tracked uppercase label, press-scale, optional haptic,
 * loading & disabled states, leading/trailing icon slots. `glow` is accepted for
 * backwards compatibility and intentionally renders nothing — the brand no longer
 * uses luminous halos on controls.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { ControlHeight, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics as hapticsUtil } from '@/utils';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'gradient' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
  /** @deprecated No visual effect — kept so existing call sites compile. */
  glow?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
};

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: ControlHeight.sm,
  md: ControlHeight.md,
  lg: ControlHeight.lg,
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  pill = false,
  glow: _glow,
  leftIcon,
  rightIcon,
  haptic = true,
  disabled,
  onPress,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);

  const isDisabled = disabled || loading;
  const radius = pill ? Radius.pill : Radius.xs;

  const palette: Record<ButtonVariant, { bg: string; border: string; fg: string }> = {
    primary: { bg: colors.cta, border: colors.cta, fg: colors.onCta },
    gradient: { bg: colors.accent, border: 'transparent', fg: colors.text.onAccent },
    secondary: { bg: colors.surfaceElevated, border: colors.border, fg: colors.text.primary },
    outline: { bg: 'transparent', border: colors.borderStrong, fg: colors.text.primary },
    ghost: { bg: 'transparent', border: 'transparent', fg: colors.text.primary },
  };
  const p = palette[variant];

  const content = loading ? (
    <ActivityIndicator color={p.fg} size="small" />
  ) : (
    <View style={styles.content}>
      {leftIcon}
      <Text variant="button" colorValue={p.fg} uppercase numberOfLines={1}>
        {label}
      </Text>
      {rightIcon}
    </View>
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={(e) => {
        if (haptic) hapticsUtil.light();
        onPress?.(e);
      }}
      style={[
        styles.base,
        {
          height: SIZE_HEIGHT[size],
          backgroundColor: p.bg,
          borderColor: p.border,
          borderRadius: radius,
          opacity: isDisabled && !loading ? 0.4 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: variant === 'ghost' ? Spacing.md : size === 'sm' ? Spacing.lg : Spacing.xxl,
        },
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={colors.goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
