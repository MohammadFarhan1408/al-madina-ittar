/**
 * Light theme — "Ivory Atelier". Warm paper grounds, ink type, gold ink accents.
 *
 * Contrast (WCAG 2.1, on background #F7F4EE / sunken #ECE6DA):
 *   text.primary 17.2 · text.secondary 7.2 · text.muted 5.5 / 4.9
 *   accent (gold ink) 5.1 / 4.5 · error 6.3 · success 5.5
 */
import { Palette } from '@/constants/colors';
import type { SemanticColors } from './types';

export const lightColors: SemanticColors = {
  background: Palette.paper,
  backgroundAlt: Palette.parchment,
  surface: Palette.pearl,
  surfaceElevated: Palette.white,
  surfaceSunken: Palette.linen,
  imageWell: Palette.parchment,

  border: 'rgba(18, 17, 15, 0.09)',
  borderStrong: 'rgba(18, 17, 15, 0.5)',

  text: {
    primary: Palette.ink,
    secondary: Palette.slate,
    muted: Palette.dusk,
    inverse: Palette.ivoryText,
    onAccent: Palette.richBlack,
  },

  cta: Palette.ink,
  onCta: Palette.ivoryText,

  accent: Palette.goldInk,
  accentSoft: 'rgba(200, 162, 75, 0.14)',
  accentStrong: Palette.bronzeDeep,

  emerald: Palette.emerald,
  burgundy: Palette.burgundy,

  success: { base: Palette.success, soft: Palette.successSoft },
  error: { base: Palette.error, soft: Palette.errorSoft },
  warning: { base: Palette.warning, soft: Palette.warningSoft },
  info: { base: Palette.info, soft: Palette.infoSoft },

  overlay: Palette.overlayLight,
  scrim: Palette.scrim,
  skeletonBase: Palette.linen,
  skeletonHighlight: Palette.parchment,

  divider: 'rgba(18, 17, 15, 0.08)',
  focus: Palette.goldInk,

  glassTint: Palette.glassLight,
  glassBorder: Palette.glassLightBorder,
  goldGlow: Palette.goldGlow,

  tabBar: 'rgba(251, 249, 245, 0.96)',
  tabBarActive: Palette.ink,
  tabBarInactive: Palette.dusk,

  heroGradient: [Palette.ink, Palette.graphite],
  heroOverlay: ['rgba(11,11,11,0.05)', 'rgba(11,11,11,0.45)', 'rgba(11,11,11,0.88)'],
  goldGradient: [Palette.giltLight, Palette.antiqueGold, Palette.giltDeep],
  noirGradient: [Palette.graphite, Palette.richBlack],
  emeraldGradient: [Palette.emeraldLight, Palette.emerald],
  surfaceGradient: [Palette.white, Palette.paper],

  shadowColor: 'rgba(40, 30, 10, 0.22)',
  glowColor: Palette.goldGlow,
};
