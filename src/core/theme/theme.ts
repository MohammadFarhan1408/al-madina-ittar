/**
 * Composes a full runtime theme: semantic colors + all design tokens + computed shadows.
 * This is the single object returned by `useTheme()`.
 */
import {
  AvatarSize,
  BorderWidth,
  ControlHeight,
  createShadows,
  IconSize,
  Layout,
  Radius,
  Spacing,
  StrokeWidth,
  Typography,
  type ShadowSet,
} from '@/constants';
import { darkColors } from '@/theme/dark';
import { lightColors } from '@/theme/light';
import type { ColorSchemeName, SemanticColors } from '@/theme/types';

export type AppTheme = {
  scheme: ColorSchemeName;
  isDark: boolean;
  colors: SemanticColors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  borderWidth: typeof BorderWidth;
  strokeWidth: typeof StrokeWidth;
  typography: typeof Typography;
  iconSize: typeof IconSize;
  controlHeight: typeof ControlHeight;
  avatarSize: typeof AvatarSize;
  layout: typeof Layout;
  shadows: ShadowSet;
};

const buildTheme = (scheme: ColorSchemeName): AppTheme => {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  // Standard elevations use the neutral shadow color; the `glow` preset is re-tinted
  // with the theme's gold glow color for luminous accents.
  const shadows = {
    ...createShadows(colors.shadowColor),
    glow: createShadows(colors.glowColor).glow,
  };
  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    spacing: Spacing,
    radius: Radius,
    borderWidth: BorderWidth,
    strokeWidth: StrokeWidth,
    typography: Typography,
    iconSize: IconSize,
    controlHeight: ControlHeight,
    avatarSize: AvatarSize,
    layout: Layout,
    shadows,
  };
};

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

export const getTheme = (scheme: ColorSchemeName): AppTheme =>
  scheme === 'dark' ? darkTheme : lightTheme;
