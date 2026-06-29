/**
 * Raw brand palette for Al Madina — Luxury Art Deco perfume house.
 *
 * IMPORTANT: These are RAW values. UI code must never import from here directly.
 * Consume colors through the semantic theme maps (`src/theme/light.ts` & `dark.ts`)
 * via the `useTheme()` hook so light/dark adaptation stays centralized.
 */

export const Palette = {
  // Core brand
  richBlack: '#0B0B0B',
  obsidian: '#141414',
  charcoal: '#1C1C1E',
  onyx: '#242427',

  // Gold spectrum (the signature accent)
  antiqueGold: '#C8A24B',
  gold: '#D4AF37',
  goldBright: '#E5C158',
  champagne: '#E8D7A8',
  champagneSoft: '#F0E6CC',
  bronze: '#9A7B33',
  bronzeDeep: '#6E5722',

  // Jewel tones
  emerald: '#0F5132',
  emeraldLight: '#1B7A4D',
  burgundy: '#5A1A2B',
  burgundyLight: '#7C2438',

  // Neutrals / paper
  ivory: '#F7F3EA',
  ivoryDim: '#EEE8D9',
  pearl: '#FBF9F3',
  sand: '#E5DDCB',
  stone: '#B8AE97',
  ash: '#8A8377',
  slate: '#60646C',
  smoke: '#3A3A3C',

  white: '#FFFFFF',
  black: '#000000',

  // Status
  success: '#2E7D54',
  successSoft: '#D8EBE0',
  error: '#B23A48',
  errorSoft: '#F2DADD',
  warning: '#C9912E',
  warningSoft: '#F6EAD0',
  info: '#3A6B8C',
  infoSoft: '#DCE7EF',

  // Utility (alpha-baked overlays kept here to avoid scattering rgba in UI)
  overlayLight: 'rgba(11, 11, 11, 0.45)',
  overlayHeavy: 'rgba(11, 11, 11, 0.72)',
  overlayWhite: 'rgba(247, 243, 234, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.55)',
  goldGlow: 'rgba(212, 175, 55, 0.25)',
  goldGlowStrong: 'rgba(212, 175, 55, 0.45)',
  transparent: 'transparent',

  // Glass tints (frosted surfaces)
  glassDark: 'rgba(28, 28, 30, 0.55)',
  glassDarkBorder: 'rgba(212, 175, 55, 0.22)',
  glassLight: 'rgba(255, 255, 255, 0.55)',
  glassLightBorder: 'rgba(154, 123, 51, 0.22)',
} as const;

export type PaletteColor = keyof typeof Palette;
