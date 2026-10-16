/**
 * NotificationsScreen — paged notifications with optimistic read / read-all against the
 * real endpoints, pull-to-refresh and a guest prompt (the inbox is account-only).
 * Shows an unread count line, skeleton rows while loading and a calm empty state.
 */
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { NotificationItem } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Divider, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/queries';
import { useSessionStore } from '@/store';
import type { AppNotification } from '@/types';

export function NotificationsScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const { items, isLoading, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = items.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;
  const markOne = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
  };

  const icon = <Bell size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Inbox"
        title="Notifications"
        right={
          hasUnread ? (
            <Pressable
              hitSlop={HitSlop}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              onPress={() => markAllRead.mutate(undefined)}
              style={styles.readAll}
            >
              <Text variant="label" uppercase style={styles.underline}>
                Read all
              </Text>
            </Pressable>
          ) : null
        }
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={icon}
          title="Sign in to see notifications"
          message="Order updates and offers appear here once you have an account."
          actionLabel="Sign in"
          actionVariant="primary"
          onAction={() => router.push('/(auth)/login')}
        />
      ) : isLoading ? (
        <View style={styles.list} accessible accessibilityLabel="Loading notifications">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skelRow}>
              <Skeleton width={40} height={40} radius={20} />
              <View style={{ flex: 1, gap: Spacing.sm }}>
                <Skeleton width="60%" height={12} />
                <Skeleton width="90%" height={10} />
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ItemSeparatorComponent={Divider}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text variant="overline" color={hasUnread ? 'accent' : 'muted'} style={styles.count}>
                {hasUnread ? `${unreadCount} UNREAD` : 'ALL READ'}
              </Text>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.skelRow}>
                <Skeleton width={40} height={40} radius={20} />
                <Skeleton width="60%" height={12} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon={icon} title="All caught up" message="You have no notifications right now." />
          }
          renderItem={({ item }) => <NotificationItem notification={item} onPress={markOne} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.giant, flexGrow: 1 },
  count: { paddingBottom: Spacing.xs },
  readAll: { minHeight: 44, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
});
