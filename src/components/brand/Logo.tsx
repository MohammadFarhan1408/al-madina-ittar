/**
 * Logo — Al Madina Art Deco emblem (geometric SVG mark) with optional wordmark.
 * The mark is a stepped diamond / sunrise motif evoking a perfume flacon stopper.
 */
import { View, type ViewStyle } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from '@/components/ui/Text';

export type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  color?: string;
  style?: ViewStyle;
};

export function LogoMark({ size = 40, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  const stroke = color ?? colors.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer diamond frame */}
      <Path
        d="M50 4 L96 50 L50 96 L4 50 Z"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* Inner stepped diamond */}
      <Path d="M50 24 L76 50 L50 76 L24 50 Z" stroke={stroke} strokeWidth={2} />
      {/* Central flacon stopper bar */}
      <Rect x={44} y={38} width={12} height={24} rx={1.5} fill={stroke} />
      {/* Sunrise rays */}
      <Line x1={50} y1={50} x2={50} y2={14} stroke={stroke} strokeWidth={2} />
      <Line x1={50} y1={50} x2={86} y2={50} stroke={stroke} strokeWidth={2} />
      <Line x1={50} y1={50} x2={50} y2={86} stroke={stroke} strokeWidth={2} />
      <Line x1={50} y1={50} x2={14} y2={50} stroke={stroke} strokeWidth={2} />
    </Svg>
  );
}

export function Logo({ size = 40, showWordmark = true, color, style }: LogoProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, style]}>
      <LogoMark size={size} color={color} />
      {showWordmark ? (
        <View>
          <Text variant="title" colorValue={color} style={{ letterSpacing: 2 }}>
            AL MADINA
          </Text>
          <Text variant="overline" color="secondary">
            MAISON DE PARFUM
          </Text>
        </View>
      ) : null}
    </View>
  );
}
