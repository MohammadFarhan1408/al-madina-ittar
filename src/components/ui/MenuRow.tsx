/**
 * MenuRow — a tappable settings/profile list row: leading icon medallion, title +
 * optional subtitle, and a trailing chevron (or custom right slot, e.g. a Switch).
 */
import { ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

export type MenuRowProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  danger?: boolean;
};

export function MenuRow({
  icon,
  title,
  subtitle,
  right,
  showChevron = true,
  onPress,
  danger = false,
}: MenuRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.6 } : null]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: danger ? colors.error.soft : colors.accentSoft }]}>
          {icon}
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="bodyStrong" colorValue={danger ? colors.error.base : colors.text.primary}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (showChevron && onPress ? (
        <ChevronRight size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />
      ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
