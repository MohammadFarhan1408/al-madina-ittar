/**
 * Stepper — horizontal progress indicator for multi-step flows (checkout): small
 * numbered nodes joined by hairlines; completed and current steps in ink, gold tick.
 */
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

export type StepperProps = {
  steps: string[];
  activeIndex: number;
};

export function Stepper({ steps, activeIndex }: StepperProps) {
  const { colors } = useTheme();

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${activeIndex + 1} of ${steps.length}: ${steps[activeIndex] ?? ''}`}
    >
      {steps.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const reached = done || active;
        return (
          <View key={label} style={styles.step}>
            <View style={styles.nodeRow}>
              <View style={[styles.line, i > 0 && { backgroundColor: reached ? colors.text.primary : colors.border }]} />
              <View
                style={[
                  styles.node,
                  {
                    backgroundColor: active ? colors.cta : 'transparent',
                    borderColor: reached ? colors.text.primary : colors.borderStrong,
                  },
                ]}
              >
                {done ? (
                  <Check size={12} color={colors.accent} strokeWidth={2.5} />
                ) : (
                  <Text variant="label" colorValue={active ? colors.onCta : colors.text.muted} style={styles.num}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.line,
                  i < steps.length - 1 && { backgroundColor: done ? colors.text.primary : colors.border },
                ]}
              />
            </View>
            <Text
              variant="overline"
              colorValue={reached ? colors.text.primary : colors.text.muted}
              align="center"
              numberOfLines={1}
            >
              {label.toUpperCase()}
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
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { letterSpacing: 0 },
});
