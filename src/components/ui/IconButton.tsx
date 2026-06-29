/**
 * IconButton — tappable icon with press-scale and optional surface/badge. Used in
 * headers, cards, and toolbars. Pass a lucide icon element as `children`.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { ControlHeight, HitSlop, Radius } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** Show a filled surface circle behind the icon. */
  surface?: boolean;
  size?: number;
  /** Numeric badge shown at the top-right (e.g. cart count). */
  badgeCount?: number;
};

export function IconButton({
  children,
  surface = false,
  size = ControlHeight.md,
  badgeCount,
  onPress,
  ...rest
}: IconButtonProps) {
  const { colors, shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <AnimatedPressable
      accessibilityRole="button"
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
        surface && { backgroundColor: colors.surface, ...shadows.sm },
        animatedStyle,
      ]}
      {...rest}
    >
      {children}
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
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
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, letterSpacing: 0 },
});
