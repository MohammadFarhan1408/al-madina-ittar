/**
 * NotificationsScreen — list of notifications with a "mark all read" action, backed by
 * the real read/read-all endpoints (optimistic via mutation + invalidation).
 */
import { BellOff } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { NotificationItem } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Divider, EmptyState, Loader, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/queries';
import type { AppNotification } from '@/types';

export function NotificationsScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];

  const markOne = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Stay in the loop"
        title="Notifications"
        right={
          items.length > 0 ? (
            <Pressable hitSlop={HitSlop} onPress={() => markAllRead.mutate()}>
              <Text variant="label" color="accent" uppercase>
                Read all
              </Text>
            </Pressable>
          ) : null
        }
      />

      {isLoading ? (
        <View style={styles.loader}>
          <Loader />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BellOff size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
          title="All caught up"
          message="You have no new notifications right now."
        />
      ) : (
        <View style={styles.list}>
          {items.map((n, i) => (
            <View key={n.id}>
              <NotificationItem notification={n} onPress={markOne} />
              {i < items.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.sm },
});
