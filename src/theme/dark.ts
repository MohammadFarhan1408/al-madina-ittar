/**
 * Dark theme — "Midnight Oud". Rich black grounds with luminous gold accents.
 */
import { Palette } from '@/constants/colors';
import type { SemanticColors } from './types';

export const darkColors: SemanticColors = {
  background: Palette.richBlack,
  backgroundAlt: Palette.obsidian,
  surface: Palette.charcoal,
  surfaceElevated: Palette.onyx,
  surfaceSunken: Palette.obsidian,

  border: Palette.smoke,
  borderStrong: Palette.ash,

  text: {
    primary: Palette.ivory,
    secondary: Palette.stone,
    muted: Palette.ash,
    inverse: Palette.richBlack,
    onAccent: Palette.richBlack,
  },

  accent: Palette.gold,
  accentSoft: 'rgba(212, 175, 55, 0.16)',
  accentStrong: Palette.champagne,

  emerald: Palette.emeraldLight,
  burgundy: Palette.burgundyLight,

  success: { base: Palette.success, soft: 'rgba(46, 125, 84, 0.18)' },
  error: { base: Palette.error, soft: 'rgba(178, 58, 72, 0.18)' },
  warning: { base: Palette.warning, soft: 'rgba(201, 145, 46, 0.18)' },
  info: { base: Palette.info, soft: 'rgba(58, 107, 140, 0.18)' },

  overlay: Palette.overlayHeavy,
  scrim: Palette.scrim,
  skeletonBase: Palette.onyx,
  skeletonHighlight: Palette.smoke,

  divider: 'rgba(212, 175, 55, 0.14)',

  glassTint: Palette.glassDark,
  glassBorder: Palette.glassDarkBorder,
  goldGlow: Palette.goldGlowStrong,

  tabBar: 'rgba(15, 15, 16, 0.92)',
  tabBarActive: Palette.gold,
  tabBarInactive: Palette.ash,

  heroGradient: [Palette.black, Palette.charcoal, Palette.bronzeDeep],
  heroOverlay: ['rgba(11,11,11,0.15)', 'rgba(11,11,11,0.72)', 'rgba(11,11,11,0.97)'],
  goldGradient: [Palette.champagne, Palette.gold, Palette.bronze],
  noirGradient: [Palette.obsidian, Palette.richBlack],
  emeraldGradient: [Palette.emeraldLight, Palette.emerald],
  surfaceGradient: [Palette.charcoal, Palette.obsidian],

  shadowColor: 'rgba(0, 0, 0, 0.6)',
  glowColor: Palette.goldGlowStrong,
};
