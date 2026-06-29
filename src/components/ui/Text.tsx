/**
 * Themed Text — the only Text component used across the app. Enforces typography
 * presets and semantic colors (no raw font sizes or hex values in screens).
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { Typography, type TypographyVariant } from '@/constants';
import { useTheme } from '@/core/theme';

export type TextColorToken =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'accent'
  | 'onAccent'
  | 'error'
  | 'success';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColorToken;
  /** Override color directly (rarely needed — prefer tokens). */
  colorValue?: string;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
};

export function Text({
  variant = 'body',
  color = 'primary',
  colorValue,
  align,
  uppercase,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors } = useTheme();

  const resolvedColor =
    colorValue ??
    {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      muted: colors.text.muted,
      inverse: colors.text.inverse,
      accent: colors.accent,
      onAccent: colors.text.onAccent,
      error: colors.error.base,
      success: colors.success.base,
    }[color];

  return (
    <RNText
      style={[
        Typography[variant],
        { color: resolvedColor },
        align ? { textAlign: align } : null,
        uppercase ? { textTransform: 'uppercase' } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
