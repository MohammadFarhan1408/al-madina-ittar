/** Divider — hairline separator. */
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme';

export type DividerProps = {
  vertical?: boolean;
  spacing?: number;
  color?: string;
  style?: ViewStyle;
};

export function Divider({ vertical = false, spacing = 0, color, style }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        vertical
          ? { width: 1, alignSelf: 'stretch', marginHorizontal: spacing }
          : { height: 1, alignSelf: 'stretch', marginVertical: spacing },
        { backgroundColor: color ?? colors.border },
        style,
      ]}
    />
  );
}
