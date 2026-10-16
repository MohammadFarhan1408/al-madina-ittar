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
  /** Fill / icon / text color — AA as text on `background` and `surface`. */
  base: string;
  /** Tinted background for banners and pills. */
  soft: string;
};

export type SemanticColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;
  /** The neutral well behind product photography. */
  imageWell: string;

  /** Hairline borders (cards, rows). */
  border: string;
  /** Control borders (inputs, outline buttons) — ≥ 3:1 UI contrast. */
  borderStrong: string;

  text: TextColors;

  /** Primary call-to-action fill (ivory on dark, ink on light) + its label color. */
  cta: string;
  onCta: string;

  /** Signature gold accent — indicators, eyebrows, ratings. AA as text. */
  accent: string;
  accentSoft: string;
  accentStrong: string;

  /** Secondary jewel accents (collection swatches only). */
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
  /** Focus ring for inputs. */
  focus: string;

  /** Frosted-glass surface fill + border (used by GlassSurface fallback). */
  glassTint: string;
  glassBorder: string;

  /** Gold luminous glow color (shadows / halos) — kept faint by design. */
  goldGlow: string;

  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;

  /** Gradient stop arrays (>= 2 stops) for expo-linear-gradient. */
  heroGradient: readonly [string, string, ...string[]];
  /** Translucent scrim laid over hero imagery for legible text. */
  heroOverlay: readonly [string, string, ...string[]];
  /** Brushed-metal stops for the single metallic CTA. */
  goldGradient: readonly [string, string, ...string[]];
  noirGradient: readonly [string, string, ...string[]];
  emeraldGradient: readonly [string, string, ...string[]];
  surfaceGradient: readonly [string, string, ...string[]];

  shadowColor: string;
  /** Gold-tinted shadow for the `glow` elevation preset. */
  glowColor: string;
};

export type ColorSchemeName = 'light' | 'dark';
