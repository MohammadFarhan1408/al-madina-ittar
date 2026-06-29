/**
 * Scroll-driven animation helpers for premium hero/header behaviour.
 * Share one `scrollY` shared value across a screen: drive the Animated.ScrollView with
 * `useScrollHandler`, then derive parallax / fade styles from it.
 */
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

export function useScrollY() {
  const scrollY = useSharedValue(0);
  const handler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  return { scrollY, handler };
}

/** Parallax + subtle zoom for a hero image as the page scrolls up. */
export function useHeroParallax(scrollY: SharedValue<number>, height: number) {
  return useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-height, 0, height],
          [-height / 2, 0, height * 0.4],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(scrollY.value, [-height, 0], [1.6, 1], Extrapolation.CLAMP),
      },
    ],
  }));
}

/** Fades/translates a floating header in once the user scrolls past `threshold`. */
export function useHeaderReveal(scrollY: SharedValue<number>, threshold = 120) {
  return useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [threshold * 0.4, threshold], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, threshold], [-12, 0], Extrapolation.CLAMP),
      },
    ],
  }));
}
