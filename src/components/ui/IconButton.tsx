/**
 * IconButton — tappable icon with press-scale, an optional hairline surface and a
 * count badge. Always ≥ 44pt. Pass a lucide icon element as `children` and ALWAYS an
 * `accessibilityLabel` (icon-only controls are otherwise silent to screen readers).
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { HitSlop, Radius } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** Show a hairline-bordered surface circle behind the icon. */
  surface?: boolean;
  /** Use a translucent dark disc — for controls laid over photography. */
  onImage?: boolean;
  size?: number;
  /** Numeric badge shown at the top-right (e.g. cart count). */
  badgeCount?: number;
};

export function IconButton({
  children,
  surface = false,
  onImage = false,
  size = 44,
  badgeCount,
  onPress,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;
  const label =
    showBadge && accessibilityLabel ? `${accessibilityLabel}, ${badgeCount}` : accessibilityLabel;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HitSlop}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={(e) => {
        haptics.selection();
        onPress?.(e);
      }}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: Radius.pill },
        surface && {
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        onImage && { backgroundColor: 'rgba(11,11,11,0.38)' },
        animatedStyle,
      ]}
      {...rest}
    >
      {children}
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
          <Text variant="label" colorValue={colors.text.onAccent} style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, lineHeight: 11, letterSpacing: 0 },
});
