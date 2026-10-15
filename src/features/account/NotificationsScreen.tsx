/**
 * NotificationsScreen — paged notifications with optimistic read / read-all against the
 * real endpoints, pull-to-refresh and a guest prompt (the inbox is account-only).
 */
import { BellOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { NotificationItem } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Divider, EmptyState, ErrorState, Loader, Text } from '@/components/ui';
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

  const hasUnread = items.some((n) => !n.read);
  const markOne = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
  };

  const icon = <BellOff size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Stay in the loop"
        title="Notifications"
        right={
          hasUnread ? (
            <Pressable
              hitSlop={HitSlop}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              onPress={() => markAllRead.mutate(undefined)}
            >
              <Text variant="label" color="accent" uppercase>
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
          onAction={() => router.push('/(auth)/login')}
        />
      ) : isLoading ? (
        <View style={styles.loader}>
          <Loader />
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
          ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
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
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.sm, paddingBottom: Spacing.giant, flexGrow: 1 },
});
