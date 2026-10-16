/**
 * NotificationItem — one inbox row: a hairline-ringed kind icon, title (strong when
 * unread), body, date, and a gold unread dot. Read rows recede to secondary ink.
 */
import { BellRing, Gift, Heart, Package } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants';
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
  const Icon = ICONS[notification.kind as NotificationKind] ?? BellRing;
  const unread = !notification.read;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Unread. ' : ''}${notification.title}. ${notification.body}. ${notification.date}`}
      accessibilityHint={unread ? 'Marks as read' : undefined}
      onPress={() => onPress?.(notification)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.iconWrap, { borderColor: unread ? colors.borderStrong : colors.border }]}>
        <Icon size={17} color={unread ? colors.accent : colors.text.muted} strokeWidth={1.5} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant={unread ? 'bodyStrong' : 'body'}
            color={unread ? 'primary' : 'secondary'}
            numberOfLines={1}
            style={styles.flex}
          >
            {notification.title}
          </Text>
          <Text variant="caption" color="muted">
            {notification.date}
          </Text>
        </View>
        <Text variant="caption" color={unread ? 'secondary' : 'muted'} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
      <View style={[styles.dot, { backgroundColor: unread ? colors.accent : 'transparent' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.lg },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  flex: { flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
});
