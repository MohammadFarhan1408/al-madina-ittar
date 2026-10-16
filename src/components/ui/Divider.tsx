/** Divider — hairline separator. */
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme';

export type DividerProps = {
  vertical?: boolean;
  spacing?: number;
  color?: string;
  style?: ViewStyle;
};

export function Divider({ vertical = false, spacing = 0, color, style }: DividerProps) {
  const { colors } = useTheme();
  const w = StyleSheet.hairlineWidth;
  return (
    <View
      style={[
        vertical
          ? { width: w, alignSelf: 'stretch', marginHorizontal: spacing }
          : { height: w, alignSelf: 'stretch', marginVertical: spacing },
        { backgroundColor: color ?? colors.divider },
        style,
      ]}
    />
  );
}
