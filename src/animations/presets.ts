/**
 * Reanimated layout-animation & timing presets. Components consume these so motion
 * stays consistent — "polished, not flashy".
 */
import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

import { Duration, Springs, Stagger } from '@/constants';

export const timing = {
  fast: { duration: Duration.fast, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
  normal: { duration: Duration.normal, easing: Easing.bezier(0.2, 0, 0, 1) } satisfies WithTimingConfig,
  slow: { duration: Duration.slow, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
};

export const spring = {
  soft: Springs.soft satisfies WithSpringConfig,
  responsive: Springs.responsive satisfies WithSpringConfig,
  bouncy: Springs.bouncy satisfies WithSpringConfig,
};

export const withSoftSpring = <T extends number>(value: T) => withSpring(value, spring.soft);
export const withBouncySpring = <T extends number>(value: T) => withSpring(value, spring.bouncy);
export const withFastTiming = <T extends number>(value: T) => withTiming(value, timing.fast);

/** Entering animations for lists & sections. */
export const enter = {
  fade: () => FadeIn.duration(Duration.normal),
  fadeUp: () => FadeInUp.duration(Duration.normal).easing(Easing.out(Easing.cubic)),
  fadeDown: () => FadeInDown.duration(Duration.normal).easing(Easing.out(Easing.cubic)),
  /** Staggered entrance for grid/list items by index. */
  staggered: (index: number) =>
    FadeInDown.delay(index * Stagger.item)
      .duration(Duration.normal)
      .easing(Easing.out(Easing.cubic)),
};

export const exit = {
  fade: () => FadeOut.duration(Duration.fast),
};
