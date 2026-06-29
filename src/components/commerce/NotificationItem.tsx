/**
 * NotificationItem — a single notification row with kind icon, title/body, date and an
 * unread marker.
 */
import { BellRing, Gift, Heart, Package } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { AppNotification, NotificationKind } from '@/types';

const ICONS = {
  order: Package,
  promo: Gift,
  wishlist: Heart,
  system: BellRing,
} as const;

export function NotificationItem({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress?: (n: AppNotification) => void;
}) {
  const { colors } = useTheme();
  const Icon = ICONS[notification.kind as NotificationKind];

  return (
    <Pressable
      onPress={() => onPress?.(notification)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: notification.read ? colors.surfaceSunken : colors.accentSoft },
        ]}
      >
        <Icon size={IconSize.sm} color={colors.accent} strokeWidth={1.75} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {notification.title}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={2}>
          {notification.body}
        </Text>
        <Text variant="label" color="muted">
          {notification.date}
        </Text>
      </View>
      {!notification.read ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.lg, paddingVertical: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: Spacing.sm },
});
