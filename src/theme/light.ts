/**
 * Light theme — "Ivory Atelier". Warm paper grounds with gold & jewel accents.
 */
import { Palette } from '@/constants/colors';
import type { SemanticColors } from './types';

export const lightColors: SemanticColors = {
  background: Palette.pearl,
  backgroundAlt: Palette.ivory,
  surface: Palette.white,
  surfaceElevated: Palette.white,
  surfaceSunken: Palette.ivoryDim,

  border: Palette.sand,
  borderStrong: Palette.stone,

  text: {
    primary: Palette.richBlack,
    secondary: Palette.slate,
    muted: Palette.ash,
    inverse: Palette.ivory,
    onAccent: Palette.richBlack,
  },

  accent: Palette.antiqueGold,
  accentSoft: Palette.champagneSoft,
  accentStrong: Palette.bronze,

  emerald: Palette.emerald,
  burgundy: Palette.burgundy,

  success: { base: Palette.success, soft: Palette.successSoft },
  error: { base: Palette.error, soft: Palette.errorSoft },
  warning: { base: Palette.warning, soft: Palette.warningSoft },
  info: { base: Palette.info, soft: Palette.infoSoft },

  overlay: Palette.overlayLight,
  scrim: Palette.scrim,
  skeletonBase: Palette.ivoryDim,
  skeletonHighlight: Palette.pearl,

  divider: 'rgba(154, 123, 51, 0.18)',

  glassTint: Palette.glassLight,
  glassBorder: Palette.glassLightBorder,
  goldGlow: Palette.goldGlow,

  tabBar: 'rgba(255, 255, 255, 0.92)',
  tabBarActive: Palette.antiqueGold,
  tabBarInactive: Palette.ash,

  heroGradient: [Palette.richBlack, Palette.smoke, Palette.bronze],
  heroOverlay: ['rgba(11,11,11,0.05)', 'rgba(11,11,11,0.45)', 'rgba(11,11,11,0.85)'],
  goldGradient: [Palette.champagne, Palette.antiqueGold, Palette.bronze],
  noirGradient: [Palette.smoke, Palette.richBlack],
  emeraldGradient: [Palette.emeraldLight, Palette.emerald],
  surfaceGradient: [Palette.white, Palette.ivory],

  shadowColor: 'rgba(90, 70, 20, 0.35)',
  glowColor: Palette.goldGlow,
};
