/**
 * Elevation / shadow presets.
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
  xs: { offsetY: 1, radius: 2, opacity: 0.1, elevation: 1 },
  sm: { offsetY: 2, radius: 6, opacity: 0.14, elevation: 3 },
  md: { offsetY: 6, radius: 12, opacity: 0.18, elevation: 6 },
  lg: { offsetY: 10, radius: 22, opacity: 0.22, elevation: 12 },
  xl: { offsetY: 16, radius: 32, opacity: 0.28, elevation: 20 },
  /** Luminous gold halo — pass the theme's goldGlow color via createShadows. */
  glow: { offsetY: 0, radius: 24, opacity: 0.9, elevation: 14 },
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
