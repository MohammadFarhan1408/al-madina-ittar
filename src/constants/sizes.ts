/**
 * Component sizing tokens: icons, controls, avatars, and other fixed dimensions.
 */
export const IconSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  xxl: 40,
} as const;

/** All interactive heights are ≥ 44pt (Apple HIG / WCAG 2.5.5 target size). */
export const ControlHeight = {
  sm: 44,
  md: 50,
  lg: 54,
  xl: 58,
} as const;

export const AvatarSize = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 88,
} as const;

export const HitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export const StrokeWidth = {
  hair: 1.25,
  thin: 1.5,
  regular: 1.75,
  bold: 2,
} as const;

export type IconSizeToken = keyof typeof IconSize;
export type ControlHeightToken = keyof typeof ControlHeight;
export type AvatarSizeToken = keyof typeof AvatarSize;
