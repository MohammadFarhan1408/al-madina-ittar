/**
 * OptionRow — a selectable radio row for addresses, delivery and payment choices.
 * Hairline frame that turns ink when selected, a line icon, title + detail, an optional
 * trailing meta (e.g. a fee), and a crisp radio. Announced as a radio to screen readers.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';

export function OptionRow({
  icon,
  title,
  subtitle,
  meta,
  selected,
  onPress,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Short trailing value, e.g. "AED 30" or "Free". */
  meta?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={[title, subtitle, meta].filter(Boolean).join(', ')}
      onPress={() => {
        if (!selected) haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: selected ? colors.text.primary : colors.border,
          backgroundColor: selected ? colors.surfaceElevated : 'transparent',
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.body}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text variant="caption" color={selected ? 'primary' : 'secondary'}>
          {meta}
        </Text>
      ) : null}
      <View style={[styles.radio, { borderColor: selected ? colors.text.primary : colors.borderStrong }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: 64,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  icon: { width: 22, alignItems: 'center' },
  body: { flex: 1, gap: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
