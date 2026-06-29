/**
 * Animation timing & spring tokens. Reanimated presets in `src/animations` consume these,
 * keeping motion consistent and "polished, not flashy".
 */
import { Easing } from 'react-native-reanimated';

export const Duration = {
  instant: 120,
  fast: 200,
  normal: 320,
  slow: 480,
  splash: 900,
} as const;

export const Easings = {
  standard: Easing.bezier(0.25, 0.1, 0.25, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
} as const;

export const Springs = {
  /** Gentle, premium settle — default for press & entrance. */
  soft: { damping: 18, stiffness: 180, mass: 1 },
  /** Snappier, for toggles and badges. */
  responsive: { damping: 15, stiffness: 260, mass: 0.9 },
  /** Bouncy accent for add-to-cart / wishlist pops. */
  bouncy: { damping: 12, stiffness: 320, mass: 0.8 },
} as const;

export const Stagger = {
  item: 60,
  section: 120,
} as const;

export type DurationToken = keyof typeof Duration;
export type SpringToken = keyof typeof Springs;
