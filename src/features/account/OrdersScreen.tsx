/**
 * OrdersScreen — order history (newest first) with status filter chips, infinite scroll
 * and pull-to-refresh. Guests have no history (the list endpoint needs an account).
 * Loading shows card-shaped skeletons; filters stay pinned under the header.
 */
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { PackageOpen } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { enter } from "@/animations";
import { OrderCard } from "@/components/commerce";
import { StackHeader } from "@/components/layout";
import { Chip, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconSize, Layout, Radius, Spacing } from "@/constants";
import { useTheme } from "@/core/theme";
import { useOrdersList } from "@/hooks/queries";
import { useSessionStore } from "@/store";
import type { OrderStatus } from "@/types";

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "All" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrdersScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const {
    items,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrdersList(status);

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="History" title="My Orders" />
        <EmptyState
          icon={
            <PackageOpen
              size={IconSize.lg}
              color={colors.text.secondary}
              strokeWidth={1.25}
            />
          }
          title="Sign in to see your orders"
          message="Your order history and tracking live in your account."
          actionLabel="Sign in"
          actionVariant="primary"
          onAction={() => router.push("/(auth)/login")}
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
        style={[styles.filterScroll, { borderBottomColor: colors.divider }]}
        contentContainerStyle={styles.filters}
        accessibilityLabel="Filter orders by status"
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.label}
            label={f.label}
            selected={status === f.value}
            onPress={() => setStatus(f.value)}
          />
        ))}
      </ScrollView>
      {isLoading ? (
        <View
          style={styles.skeletons}
          accessible
          accessibilityLabel="Loading orders"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
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
          contentContainerStyle={{
            padding: Layout.screenPadding,
            paddingBottom: Spacing.giant,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerSkeleton}>
                <OrderCardSkeleton />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={
                <PackageOpen
                  size={IconSize.lg}
                  color={colors.text.secondary}
                  strokeWidth={1.25}
                />
              }
              title={status ? `No ${status} orders` : "No orders yet"}
              message={
                status
                  ? "Try another filter to see the rest of your orders."
                  : "When you place an order it will appear here, ready to track."
              }
              actionLabel={status ? "Show all orders" : "Start shopping"}
              onAction={() =>
                status ? setStatus(undefined) : router.push("/(tabs)/shop")
              }
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={enter.staggered(index % 8)}>
              <OrderCard
                order={item}
                onPress={(order) => router.push(`/orders/${order.id}`)}
              />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function OrderCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.skeletonCard, { borderColor: colors.border }]}>
      <View style={styles.skeletonRow}>
        <View style={{ gap: Spacing.sm }}>
          <Skeleton width={110} height={10} />
          <Skeleton width={80} height={9} />
        </View>
        <Skeleton width={84} height={22} radius={Radius.pill} />
      </View>
      <View style={styles.skeletonRow}>
        <Skeleton width={120} height={54} radius={Radius.xs} />
        <Skeleton width={70} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterScroll: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filters: {
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  skeletons: { padding: Layout.screenPadding, gap: Spacing.md },
  footerSkeleton: { paddingTop: Spacing.md },
  skeletonCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
