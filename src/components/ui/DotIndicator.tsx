/**
 * DotIndicator — animated page/progress dots (onboarding, product gallery).
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';

export type DotIndicatorProps = {
  count: number;
  activeIndex: number;
  style?: ViewStyle;
};

function Dot({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 7),
    backgroundColor: withTiming(active ? colors.accent : colors.border),
  }));
  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function DotIndicator({ count, activeIndex, style }: DotIndicatorProps) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dot: { height: 7, borderRadius: 4 },
});
