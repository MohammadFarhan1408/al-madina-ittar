/**
 * OrdersScreen — order history (newest first) with status filter chips, infinite scroll
 * and pull-to-refresh. Guests have no history (the list endpoint needs an account).
 */
import { FlashList } from '@shopify/flash-list';
import { PackageOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { OrderCard } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Chip, EmptyState, ErrorState, Loader } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useOrdersList } from '@/hooks/queries';
import { useSessionStore } from '@/store';
import type { OrderStatus } from '@/types';

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function OrdersScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const { items, isLoading, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOrdersList(status);

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="History" title="My Orders" />
        <EmptyState
          icon={<PackageOpen size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
          title="Sign in to see your orders"
          message="Your order history and tracking live in your account."
          actionLabel="Sign in"
          onAction={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="History" title="My Orders" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <Chip key={f.label} label={f.label} selected={status === f.value} onPress={() => setStatus(f.value)} />
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={styles.loader}>
          <Loader />
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          contentContainerStyle={{ padding: Layout.screenPadding, paddingBottom: Spacing.giant }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
          ListEmptyComponent={
            <EmptyState
              icon={<PackageOpen size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
              title={status ? `No ${status} orders` : 'No orders yet'}
              message={
                status
                  ? 'Try another filter to see the rest of your orders.'
                  : 'When you place an order it will appear here, ready to track.'
              }
              actionLabel={status ? 'Show all orders' : 'Start shopping'}
              onAction={() => (status ? setStatus(undefined) : router.push('/(tabs)/shop'))}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={enter.staggered(index)}>
              <OrderCard order={item} onPress={(order) => router.push(`/orders/${order.id}`)} />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { flexGrow: 0 },
  filters: { gap: Spacing.sm, paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.md },
});
