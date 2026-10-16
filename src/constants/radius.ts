/**
 * Border radius scale. Couture geometry: controls are near-square (xs), product
 * imagery and cards stay crisp (sm/md), only sheets and the tab bar soften (xl+).
 */
export const Radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
  round: 9999,
} as const;

export const BorderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  regular: 1.5,
  thick: 2,
  heavy: 3,
} as const;

export type RadiusToken = keyof typeof Radius;
export type BorderWidthToken = keyof typeof BorderWidth;
