/**
 * Elevation / shadow presets. Deliberately soft: luxury surfaces separate with
 * hairlines and tone, and shadow is a whisper rather than a drop.
 *
 * Shadow COLOR is theme-dependent (gold-tinted on dark surfaces, soft black on light),
 * so shadows are produced by a factory the theme calls — see `src/theme/light.ts` & `dark.ts`.
 * Components read finished shadow styles from `useTheme().shadows`.
 */
import { Platform, type ViewStyle } from 'react-native';

type ShadowParams = {
  offsetY: number;
  radius: number;
  opacity: number;
  elevation: number;
};

const ELEVATIONS = {
  none: { offsetY: 0, radius: 0, opacity: 0, elevation: 0 },
  xs: { offsetY: 1, radius: 2, opacity: 0.06, elevation: 1 },
  sm: { offsetY: 2, radius: 8, opacity: 0.08, elevation: 2 },
  md: { offsetY: 8, radius: 20, opacity: 0.1, elevation: 4 },
  lg: { offsetY: 14, radius: 32, opacity: 0.14, elevation: 10 },
  xl: { offsetY: 22, radius: 48, opacity: 0.18, elevation: 16 },
  /** Faint gold halo — kept whisper-quiet; the brand reads through type, not glow. */
  glow: { offsetY: 0, radius: 18, opacity: 0.5, elevation: 0 },
} as const satisfies Record<string, ShadowParams>;

export type ShadowToken = keyof typeof ELEVATIONS;

const toShadowStyle = (color: string, p: ShadowParams): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: p.offsetY },
      shadowOpacity: p.opacity,
      shadowRadius: p.radius,
    },
    android: { elevation: p.elevation, shadowColor: color },
    default: {
      // react-native-web understands boxShadow
      ...({
        boxShadow: `0px ${p.offsetY}px ${p.radius}px rgba(0,0,0,${p.opacity})`,
      } as ViewStyle),
    },
  }) as ViewStyle;

export type ShadowSet = Record<ShadowToken, ViewStyle>;

/** Build the full shadow set for a given (theme-provided) shadow color. */
export const createShadows = (color: string): ShadowSet =>
  (Object.keys(ELEVATIONS) as ShadowToken[]).reduce((acc, key) => {
    acc[key] = toShadowStyle(color, ELEVATIONS[key]);
    return acc;
  }, {} as ShadowSet);
