/**
 * Button — primary brand control. Variants: primary (solid gold), gradient (gold sheen,
 * the hero CTA), secondary (emerald), outline, ghost. Press-scale, optional haptics &
 * gold glow, loading & disabled states, and leading/trailing icon slots.
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
  glow = false,
  leftIcon,
  rightIcon,
  haptic = true,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);

  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; border: string; fg: string }> = {
    primary: { bg: colors.accent, border: colors.accent, fg: colors.text.onAccent },
    gradient: { bg: 'transparent', border: 'transparent', fg: colors.text.onAccent },
    secondary: { bg: colors.emerald, border: colors.emerald, fg: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.accent, fg: colors.accent },
    ghost: { bg: 'transparent', border: 'transparent', fg: colors.accent },
  };
  const p = palette[variant];

  const content = loading ? (
    <ActivityIndicator color={p.fg} size="small" />
  ) : (
    <View style={styles.content}>
      {leftIcon}
      <Text variant="button" colorValue={p.fg} uppercase>
        {label}
      </Text>
      {rightIcon}
    </View>
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
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
          borderRadius: pill ? Radius.pill : Radius.sm,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? Spacing.lg : Spacing.xxl,
        },
        glow && !isDisabled ? shadows.glow : null,
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
          style={[StyleSheet.absoluteFill, { borderRadius: pill ? Radius.pill : Radius.sm }]}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
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
