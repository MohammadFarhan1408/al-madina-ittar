/**
 * Raw brand palette for Al Madina Ittar — a contemporary Arabian perfume house.
 *
 * Direction: "Noir Atelier". Black and ivory carry the experience; metallic gold is a
 * restrained accent (indicators, eyebrows, ratings, one hero CTA) — never a wash.
 *
 * IMPORTANT: These are RAW values. UI code must never import from here directly
 * (the exception is copy laid over photography, which is always on dark).
 * Consume colors through the semantic theme maps (`src/theme/light.ts` & `dark.ts`)
 * via the `useTheme()` hook so light/dark adaptation stays centralized.
 *
 * Contrast notes (WCAG 2.1, verified): see the semantic maps — every text token is
 * ≥ 4.5:1 on the surfaces it is used on.
 */

export const Palette = {
  // ── Noir scale (dark grounds) ─────────────────────────────────────────────
  richBlack: '#0B0B0B',
  noir: '#0F0F0E',
  obsidian: '#131312',
  charcoal: '#181715',
  onyx: '#201F1C',
  graphite: '#2A2925',

  // ── Gold (the signature accent — use sparingly) ───────────────────────────
  antiqueGold: '#C8A24B',
  gold: '#D4AF37',
  goldBright: '#E5C158',
  champagne: '#E8D7A8',
  champagneSoft: '#F0E6CC',
  bronze: '#9A7B33',
  bronzeDeep: '#6E5722',
  /** AA gold for text on light (ivory/white) surfaces — 5.1:1 on ivory. */
  goldInk: '#7D6425',
  /** Brushed-metal stops for the single metallic CTA. */
  giltLight: '#E3CF9C',
  giltDeep: '#B8913F',

  // ── Jewel tones (collection swatches only) ────────────────────────────────
  emerald: '#0F5132',
  emeraldLight: '#1B7A4D',
  burgundy: '#5A1A2B',
  burgundyLight: '#7C2438',
  /** Lifted jewel tones legible as thin rules on dark photography. */
  emeraldLift: '#4FA57B',
  burgundyLift: '#C25A6E',

  // ── Ivory scale (light grounds + text on dark) ────────────────────────────
  ivory: '#F7F3EA',
  ivoryText: '#F3EEE3',
  ivoryDim: '#EEE8D9',
  pearl: '#FBF9F3',
  paper: '#F7F4EE',
  parchment: '#F1ECE2',
  linen: '#ECE6DA',
  sand: '#E5DDCB',
  stone: '#B8AE97',
  taupe: '#B5AD9D',
  ash: '#8C8578',
  slate: '#55514A',
  dusk: '#67625A',
  smoke: '#3A3A3C',
  ink: '#12110F',

  white: '#FFFFFF',
  black: '#000000',

  // ── Status ────────────────────────────────────────────────────────────────
  success: '#2A6F4B',
  successBright: '#6FBF93',
  successSoft: '#DCEBE2',
  error: '#A3303E',
  errorBright: '#E07A86',
  errorSoft: '#F3DEE1',
  warning: '#8A6114',
  warningBright: '#E0B357',
  warningSoft: '#F6EAD0',
  info: '#2F5D7C',
  infoBright: '#86B3D1',
  infoSoft: '#DCE7EF',

  // ── Utility (alpha-baked overlays kept here to avoid scattering rgba in UI) ─
  overlayLight: 'rgba(11, 11, 11, 0.45)',
  overlayHeavy: 'rgba(11, 11, 11, 0.72)',
  overlayWhite: 'rgba(247, 243, 234, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  goldGlow: 'rgba(200, 162, 75, 0.18)',
  goldGlowStrong: 'rgba(200, 162, 75, 0.28)',
  transparent: 'transparent',

  // Glass tints (frosted surfaces)
  glassDark: 'rgba(15, 15, 14, 0.72)',
  glassDarkBorder: 'rgba(243, 238, 227, 0.10)',
  glassLight: 'rgba(251, 249, 245, 0.78)',
  glassLightBorder: 'rgba(18, 17, 15, 0.08)',
} as const;

export type PaletteColor = keyof typeof Palette;
