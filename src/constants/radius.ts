/**
 * Border radius scale. Art Deco favours crisp geometry, so radii stay restrained.
 */
export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
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
