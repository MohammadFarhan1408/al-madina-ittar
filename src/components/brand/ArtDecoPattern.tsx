/**
 * ArtDecoPattern — a tiling geometric backdrop (sunburst fans + chevrons) rendered as
 * a single low-opacity SVG. Used behind heroes, headers and section backgrounds to add
 * heritage texture without distracting from content.
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/core/theme';

export type ArtDecoPatternProps = {
  color?: string;
  opacity?: number;
  size?: number;
  style?: ViewStyle;
};

export function ArtDecoPattern({ color, opacity = 0.035, size = 80, style }: ArtDecoPatternProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="deco" width={size} height={size} patternUnits="userSpaceOnUse">
            <G stroke={tint} strokeWidth={1} fill="none">
              {/* fan / sunburst */}
              <Path d={`M${size / 2} ${size} L0 0`} />
              <Path d={`M${size / 2} ${size} L${size / 4} 0`} />
              <Path d={`M${size / 2} ${size} L${size / 2} 0`} />
              <Path d={`M${size / 2} ${size} L${(size * 3) / 4} 0`} />
              <Path d={`M${size / 2} ${size} L${size} 0`} />
              {/* chevron band */}
              <Line x1={0} y1={size / 2} x2={size / 2} y2={size / 4} />
              <Line x1={size / 2} y1={size / 4} x2={size} y2={size / 2} />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#deco)" />
      </Svg>
    </View>
  );
}
