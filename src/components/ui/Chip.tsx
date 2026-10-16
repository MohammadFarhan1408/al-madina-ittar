/**
 * Chip — selectable filter pill (scent families, recent searches). Selected state is
 * an inverted fill (ivory/ink), not gold, so the accent stays rare. ≥ 44pt tall touch
 * area via hitSlop while keeping a slim visual.
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
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={{ top: 6, bottom: 6 }}
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: 36,
          justifyContent: 'center',
          paddingHorizontal: Spacing.lg,
          borderRadius: Radius.pill,
          borderWidth: 1,
          backgroundColor: selected ? colors.cta : 'transparent',
          borderColor: selected ? colors.cta : colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text variant="label" colorValue={selected ? colors.onCta : colors.text.secondary} uppercase>
        {label}
      </Text>
    </Pressable>
  );
}
