/**
 * Semantic color contract. Both light & dark maps implement this exact shape so the
 * rest of the app can rely on a stable set of tokens regardless of scheme.
 */
export type TextColors = {
  primary: string;
  secondary: string;
  muted: string;
  inverse: string;
  onAccent: string;
};

export type StatusColor = {
  base: string;
  soft: string;
};

export type SemanticColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;

  border: string;
  borderStrong: string;

  text: TextColors;

  /** Signature gold accent. */
  accent: string;
  accentSoft: string;
  accentStrong: string;

  /** Secondary jewel accents. */
  emerald: string;
  burgundy: string;

  success: StatusColor;
  error: StatusColor;
  warning: StatusColor;
  info: StatusColor;

  overlay: string;
  scrim: string;
  skeletonBase: string;
  skeletonHighlight: string;

  /** Hairline separator color. */
  divider: string;

  /** Frosted-glass surface fill + border (used by GlassSurface fallback). */
  glassTint: string;
  glassBorder: string;

  /** Gold luminous glow color (shadows / halos). */
  goldGlow: string;

  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;

  /** Gradient stop arrays (>= 2 stops) for expo-linear-gradient. */
  heroGradient: readonly [string, string, ...string[]];
  /** Translucent scrim laid over hero imagery for legible text. */
  heroOverlay: readonly [string, string, ...string[]];
  goldGradient: readonly [string, string, ...string[]];
  noirGradient: readonly [string, string, ...string[]];
  emeraldGradient: readonly [string, string, ...string[]];
  surfaceGradient: readonly [string, string, ...string[]];

  shadowColor: string;
  /** Gold-tinted shadow for the `glow` elevation preset. */
  glowColor: string;
};

export type ColorSchemeName = 'light' | 'dark';
