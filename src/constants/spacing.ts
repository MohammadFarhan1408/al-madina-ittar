/**
 * Spacing scale — 4px base grid. Use tokens everywhere; never hardcode margins/padding.
 */
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  jumbo: 48,
  giant: 64,
} as const;

export type SpacingToken = keyof typeof Spacing;
