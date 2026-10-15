/**
 * Typography system for the Al Madina luxury brand.
 *
 * Display/Heading: Playfair Display (high-contrast Didone serif — Art Deco elegance).
 * Body/UI:         Jost (geometric sans, Futura lineage — 1920s geometry).
 *
 * Font family keys MUST match the names registered in the root font loader
 * (`src/app/_layout.tsx`). Role presets below are the ONLY approved text styles —
 * never hardcode fontSize / fontWeight / letterSpacing in components.
 */
import type { TextStyle } from 'react-native';

export const FontFamily = {
  /** Brand display face (same file as the web storefront); single weight. */
  brand: 'Fugi',
  display: 'PlayfairDisplay_600SemiBold',
  displayBold: 'PlayfairDisplay_700Bold',
  displayMedium: 'PlayfairDisplay_500Medium',
  displayItalic: 'PlayfairDisplay_500Medium_Italic',
  body: 'Jost_400Regular',
  bodyMedium: 'Jost_500Medium',
  bodySemiBold: 'Jost_600SemiBold',
  bodyBold: 'Jost_700Bold',
  bodyLight: 'Jost_300Light',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
  hero: 48,
} as const;

export const LineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
  luxe: 3,
} as const;

type TypePreset = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'
>;

const preset = (
  fontFamily: string,
  fontSize: number,
  lineHeightRatio: number,
  letterSpacing: number,
): TypePreset => ({
  fontFamily,
  fontSize,
  lineHeight: Math.round(fontSize * lineHeightRatio),
  letterSpacing,
});

/**
 * Role-based presets. Spread onto `<Text style={[Typography.heading, ...]} />`.
 */
export const Typography = {
  hero: preset(FontFamily.brand, FontSize.hero, LineHeight.tight, LetterSpacing.normal),
  display: preset(FontFamily.brand, FontSize.display, LineHeight.tight, LetterSpacing.normal),
  displayItalic: preset(FontFamily.displayItalic, FontSize.xxxl, LineHeight.snug, LetterSpacing.tight),
  heading: preset(FontFamily.display, FontSize.xxxl, LineHeight.snug, LetterSpacing.wide),
  title: preset(FontFamily.displayMedium, FontSize.xxl, LineHeight.snug, LetterSpacing.normal),
  subtitle: preset(FontFamily.bodyMedium, FontSize.lg, LineHeight.normal, LetterSpacing.normal),
  body: preset(FontFamily.body, FontSize.md, LineHeight.relaxed, LetterSpacing.normal),
  bodyStrong: preset(FontFamily.bodySemiBold, FontSize.md, LineHeight.relaxed, LetterSpacing.normal),
  caption: preset(FontFamily.body, FontSize.sm, LineHeight.normal, LetterSpacing.wide),
  label: preset(FontFamily.bodyMedium, FontSize.xs, LineHeight.normal, LetterSpacing.wider),
  button: preset(FontFamily.bodySemiBold, FontSize.md, LineHeight.tight, LetterSpacing.wide),
  // Decorative uppercase eyebrow used across luxury sections
  overline: preset(FontFamily.bodyMedium, FontSize.xs, LineHeight.normal, LetterSpacing.luxe),
  price: preset(FontFamily.displayMedium, FontSize.lg, LineHeight.tight, LetterSpacing.normal),
  priceLarge: preset(FontFamily.display, FontSize.xxl, LineHeight.tight, LetterSpacing.normal),
} as const;

export type TypographyVariant = keyof typeof Typography;
