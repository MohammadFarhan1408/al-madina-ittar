/**
 * Dark theme — "Noir Atelier". Near-black grounds, warm ivory type, restrained gold.
 *
 * Contrast (WCAG 2.1, on background #0B0B0B / surface #181715):
 *   text.primary 17.0 / 15.5 · text.secondary 8.8 / 8.0 · text.muted 5.4 / 4.9
 *   accent 8.2 / 7.4 · error 6.8 · success 9.0
 */
import { Palette } from '@/constants/colors';
import type { SemanticColors } from './types';

export const darkColors: SemanticColors = {
  background: Palette.richBlack,
  backgroundAlt: Palette.noir,
  surface: Palette.charcoal,
  surfaceElevated: Palette.onyx,
  surfaceSunken: Palette.obsidian,
  imageWell: Palette.obsidian,

  border: 'rgba(243, 238, 227, 0.09)',
  borderStrong: 'rgba(243, 238, 227, 0.32)',

  text: {
    primary: Palette.ivoryText,
    secondary: Palette.taupe,
    muted: Palette.ash,
    inverse: Palette.richBlack,
    onAccent: Palette.richBlack,
  },

  cta: Palette.ivoryText,
  onCta: Palette.richBlack,

  accent: Palette.antiqueGold,
  accentSoft: 'rgba(200, 162, 75, 0.12)',
  accentStrong: Palette.champagne,

  emerald: Palette.emeraldLight,
  burgundy: Palette.burgundyLight,

  success: { base: Palette.successBright, soft: 'rgba(111, 191, 147, 0.12)' },
  error: { base: Palette.errorBright, soft: 'rgba(224, 122, 134, 0.12)' },
  warning: { base: Palette.warningBright, soft: 'rgba(224, 179, 87, 0.12)' },
  info: { base: Palette.infoBright, soft: 'rgba(134, 179, 209, 0.12)' },

  overlay: Palette.overlayHeavy,
  scrim: Palette.scrim,
  skeletonBase: Palette.charcoal,
  skeletonHighlight: Palette.graphite,

  divider: 'rgba(243, 238, 227, 0.08)',
  focus: Palette.antiqueGold,

  glassTint: Palette.glassDark,
  glassBorder: Palette.glassDarkBorder,
  goldGlow: Palette.goldGlowStrong,

  tabBar: 'rgba(11, 11, 11, 0.94)',
  tabBarActive: Palette.ivoryText,
  tabBarInactive: Palette.ash,

  heroGradient: [Palette.noir, Palette.charcoal],
  heroOverlay: ['rgba(11,11,11,0.10)', 'rgba(11,11,11,0.55)', 'rgba(11,11,11,0.96)'],
  goldGradient: [Palette.giltLight, Palette.antiqueGold, Palette.giltDeep],
  noirGradient: [Palette.obsidian, Palette.richBlack],
  emeraldGradient: [Palette.emeraldLight, Palette.emerald],
  surfaceGradient: [Palette.charcoal, Palette.obsidian],

  shadowColor: 'rgba(0, 0, 0, 0.7)',
  glowColor: Palette.goldGlow,
};
