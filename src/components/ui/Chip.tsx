/**
 * Chip — selectable filter pill (scent families, sort options). Animated selection.
 */
import { Pressable, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, selected = false, disabled = false, onPress, style }: ChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      style={[
        {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: Radius.pill,
          borderWidth: 1,
          backgroundColor: selected ? colors.accent : 'transparent',
          borderColor: selected ? colors.accent : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text
        variant="label"
        colorValue={selected ? colors.text.onAccent : colors.text.secondary}
        uppercase
      >
        {label}
      </Text>
    </Pressable>
  );
}
