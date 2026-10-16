/**
 * ArtDecoDivider — decorative separator: tapering gold lines flanking a central diamond,
 * with an optional centered label (e.g. a section eyebrow). Used between hero/sections.
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from '@/components/ui/Text';

export type ArtDecoDividerProps = {
  color?: string;
  width?: number;
  label?: string;
  style?: ViewStyle;
};

export function ArtDecoDivider({ color, width = 120, label, style }: ArtDecoDividerProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;

  return (
    <View style={[styles.row, label ? styles.rowWide : { width }, style]}>
      <View style={[styles.line, { backgroundColor: tint }]} />
      {label ? (
        <Text variant="overline" colorValue={tint} style={styles.label}>
          {label}
        </Text>
      ) : (
        <Diamond tint={tint} />
      )}
      <View style={[styles.line, { backgroundColor: tint }]} />
    </View>
  );
}

function Diamond({ tint }: { tint: string }) {
  return (
    <View style={[styles.diamondOuter, { borderColor: tint }]}>
      <View style={[styles.diamondInner, { backgroundColor: tint }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  rowWide: { alignSelf: 'stretch' },
  line: { flex: 1, height: StyleSheet.hairlineWidth, opacity: 0.55 },
  label: { marginHorizontal: Spacing.xs },
  diamondOuter: {
    width: 7,
    height: 7,
    borderWidth: StyleSheet.hairlineWidth * 2,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondInner: { width: 0, height: 0 },
});
