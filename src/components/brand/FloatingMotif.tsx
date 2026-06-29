/**
 * FloatingMotif — a decorative diamond/sunburst SVG that drifts and rotates subtly in a
 * slow loop. Purely ornamental; used to bring static luxury surfaces to life.
 */
import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

import { useTheme } from '@/core/theme';

export type FloatingMotifProps = {
  size?: number;
  color?: string;
  opacity?: number;
  drift?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function FloatingMotif({
  size = 64,
  color,
  opacity = 0.5,
  drift = 10,
  duration = 6000,
  style,
}: FloatingMotifProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-drift, drift]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 12])}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[animatedStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Path d="M50 6 L94 50 L50 94 L6 50 Z" stroke={tint} strokeWidth={2} />
        <Path d="M50 28 L72 50 L50 72 L28 50 Z" stroke={tint} strokeWidth={1.5} />
        <Line x1={50} y1={6} x2={50} y2={94} stroke={tint} strokeWidth={0.75} />
        <Line x1={6} y1={50} x2={94} y2={50} stroke={tint} strokeWidth={0.75} />
      </Svg>
    </Animated.View>
  );
}
