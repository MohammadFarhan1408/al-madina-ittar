/**
 * Section + SectionHeader — titled content block with an optional "eyebrow" overline
 * and a trailing action (e.g. "See all"). Used across Home and feature screens.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Layout, Spacing } from '@/constants';
import { Text } from '@/components/ui/Text';

export type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, eyebrow, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headingGroup}>
        {eyebrow ? (
          <Text variant="overline" color="accent">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title">{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text variant="label" color="accent" uppercase>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export type SectionProps = SectionHeaderProps & {
  children: ReactNode;
  style?: ViewStyle;
};

export function Section({ children, style, ...header }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.headerPadding}>
        <SectionHeader {...header} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headingGroup: { gap: Spacing.xs, flex: 1 },
  headerPadding: { paddingHorizontal: Layout.screenPadding },
});
