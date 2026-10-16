/**
 * Section + SectionHeader — titled content block: tracked eyebrow, serif title and an
 * optional trailing text action ("View all →"). Used across Home and feature screens.
 */
import { ArrowRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { HitSlop, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from '@/components/ui/Text';

export type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Centered, editorial treatment (used for statement sections). */
  centered?: boolean;
};

export function SectionHeader({ title, eyebrow, actionLabel, onAction, centered }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, centered && styles.headerCentered]}>
      <View style={[styles.headingGroup, centered && styles.centeredGroup]} accessibilityRole="header">
        {eyebrow ? (
          <Text variant="overline" color="accent" uppercase>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title" align={centered ? 'center' : undefined} style={styles.title}>
          {title}
        </Text>
      </View>
      {actionLabel && onAction && !centered ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          onPress={onAction}
          hitSlop={HitSlop}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text variant="label" color="secondary" uppercase>
            {actionLabel}
          </Text>
          <ArrowRight size={12} color={colors.text.secondary} strokeWidth={1.5} />
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
  section: { gap: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  headerCentered: { justifyContent: 'center' },
  headingGroup: { gap: Spacing.xs, flex: 1 },
  centeredGroup: { alignItems: 'center' },
  title: { fontSize: 22, lineHeight: 28 },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 32 },
  headerPadding: { paddingHorizontal: Layout.screenPadding },
});
