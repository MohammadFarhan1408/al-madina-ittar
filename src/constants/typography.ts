/**
 * Typography system for Al Madina Ittar.
 *
 * Brand:   Fugi — the house display face (same file as the web storefront). Reserved
 *          for the largest moments: hero titles, the splash and the wordmark.
 * Display: Playfair Display — a high-contrast serif for screen and section titles.
 * Body/UI: Jost — a geometric sans for reading copy, prices and tracked-out labels.
 *
 * Hierarchy rule: one serif title per block, everything else in Jost. Tracked
 * uppercase (overline/label/button) does the "luxury" work, so gold is not needed
 * to signal importance.
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
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  hero: 46,
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
  wide: 0.4,
  wider: 1.2,
  widest: 2,
  luxe: 2.6,
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
  /** Fugi — hero banners and splash only. */
  hero: preset(FontFamily.brand, FontSize.hero, LineHeight.tight, LetterSpacing.normal),
  /** Fugi — large page statements (Shop, About). */
  display: preset(FontFamily.brand, FontSize.display, LineHeight.tight, LetterSpacing.normal),
  displayItalic: preset(FontFamily.displayItalic, FontSize.xxl, LineHeight.snug, LetterSpacing.tight),
  /** Serif page title. */
  heading: preset(FontFamily.displayMedium, FontSize.xxxl, LineHeight.snug, LetterSpacing.tight),
  /** Serif section / card title. */
  title: preset(FontFamily.displayMedium, FontSize.xl, LineHeight.snug, LetterSpacing.normal),
  subtitle: preset(FontFamily.bodyMedium, FontSize.lg, LineHeight.normal, LetterSpacing.normal),
  body: preset(FontFamily.body, FontSize.md, LineHeight.relaxed, LetterSpacing.normal),
  bodyStrong: preset(FontFamily.bodyMedium, FontSize.md, LineHeight.relaxed, LetterSpacing.normal),
  caption: preset(FontFamily.body, FontSize.sm, LineHeight.normal, LetterSpacing.normal),
  /** Tracked uppercase UI label (chips, field labels, meta). */
  label: preset(FontFamily.bodyMedium, FontSize.xs, LineHeight.normal, LetterSpacing.wider),
  button: preset(FontFamily.bodyMedium, FontSize.sm, LineHeight.tight, LetterSpacing.widest),
  /** Decorative uppercase eyebrow used across sections. */
  overline: preset(FontFamily.bodyMedium, FontSize.xxs, LineHeight.normal, LetterSpacing.luxe),
  price: preset(FontFamily.body, FontSize.md, LineHeight.tight, LetterSpacing.wide),
  priceLarge: preset(FontFamily.bodyLight, FontSize.xxl, LineHeight.tight, LetterSpacing.normal),
} as const;

export type TypographyVariant = keyof typeof Typography;
