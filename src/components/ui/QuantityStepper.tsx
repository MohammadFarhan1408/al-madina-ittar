/**
 * QuantityStepper — minus / value / plus control for cart & product quantity.
 * Each button is a full 44pt square; the value is announced as an adjustable control.
 */
import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { IconSize, Radius } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Compact (36pt) variant for dense rows; touch area is kept at 44pt via hitSlop. */
  compact?: boolean;
  style?: ViewStyle;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  compact = false,
  style,
}: QuantityStepperProps) {
  const { colors } = useTheme();
  const size = compact ? 36 : 44;
  const slop = compact ? 4 : 0;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      haptics.selection();
      onChange(next);
    }
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Quantity"
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      style={[styles.row, { borderColor: colors.borderStrong }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={slop}
        onPress={() => step(-1)}
        disabled={value <= min}
        style={({ pressed }) => [styles.btn, { width: size, height: size, opacity: pressed ? 0.5 : 1 }]}
      >
        <Minus size={IconSize.xs} color={value <= min ? colors.text.muted : colors.text.primary} strokeWidth={1.75} />
      </Pressable>
      <Text variant="bodyStrong" style={styles.value}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={slop}
        onPress={() => step(1)}
        disabled={value >= max}
        style={({ pressed }) => [styles.btn, { width: size, height: size, opacity: pressed ? 0.5 : 1 }]}
      >
        <Plus size={IconSize.xs} color={value >= max ? colors.text.muted : colors.text.primary} strokeWidth={1.75} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  btn: { alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 24, textAlign: 'center' },
});
