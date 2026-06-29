/**
 * QuantityStepper — minus / value / plus control for cart & product quantity.
 */
import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { HitSlop, IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  style?: ViewStyle;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  style,
}: QuantityStepperProps) {
  const { colors } = useTheme();

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      haptics.selection();
      onChange(next);
    }
  };

  return (
    <View style={[styles.row, { borderColor: colors.border }, style]}>
      <Pressable hitSlop={HitSlop} onPress={() => step(-1)} disabled={value <= min} style={styles.btn}>
        <Minus
          size={IconSize.sm}
          color={value <= min ? colors.text.muted : colors.text.primary}
          strokeWidth={2}
        />
      </Pressable>
      <Text variant="bodyStrong" style={styles.value}>
        {value}
      </Text>
      <Pressable hitSlop={HitSlop} onPress={() => step(1)} disabled={value >= max} style={styles.btn}>
        <Plus
          size={IconSize.sm}
          color={value >= max ? colors.text.muted : colors.text.primary}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xs,
  },
  btn: { padding: Spacing.sm },
  value: { minWidth: 28, textAlign: 'center' },
});
