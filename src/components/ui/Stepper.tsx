/**
 * Stepper — horizontal progress indicator for multi-step flows (checkout).
 */
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

export type StepperProps = {
  steps: string[];
  activeIndex: number;
};

export function Stepper({ steps, activeIndex }: StepperProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {steps.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const filled = done || active;
        return (
          <View key={label} style={styles.step}>
            <View style={styles.nodeRow}>
              {i > 0 ? (
                <View style={[styles.line, { backgroundColor: done || active ? colors.accent : colors.border }]} />
              ) : (
                <View style={styles.line} />
              )}
              <View
                style={[
                  styles.node,
                  {
                    backgroundColor: filled ? colors.accent : 'transparent',
                    borderColor: filled ? colors.accent : colors.border,
                  },
                ]}
              >
                {done ? (
                  <Check size={IconSize.xs} color={colors.text.onAccent} strokeWidth={3} />
                ) : (
                  <Text variant="label" colorValue={active ? colors.text.onAccent : colors.text.muted}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < steps.length - 1 ? (
                <View style={[styles.line, { backgroundColor: done ? colors.accent : colors.border }]} />
              ) : (
                <View style={styles.line} />
              )}
            </View>
            <Text
              variant="label"
              colorValue={filled ? colors.text.primary : colors.text.muted}
              align="center"
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  nodeRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  line: { flex: 1, height: 1.5 },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
