/**
 * OrdersScreen — order history grouped most-recent first, with a luxe empty state.
 */
import { FlashList } from '@shopify/flash-list';
import { PackageOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { OrderCard } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { EmptyState, Loader } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useOrders } from '@/hooks/queries';

export function OrdersScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useOrders();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="History" title="My Orders" />
      {isLoading ? (
        <View style={styles.loader}>
          <Loader />
        </View>
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Layout.screenPadding, paddingBottom: Spacing.giant }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          ListEmptyComponent={
            <EmptyState
              icon={<PackageOpen size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
              title="No orders yet"
              message="When you place an order it will appear here, ready to track."
              actionLabel="Start shopping"
              onAction={() => router.push('/(tabs)/shop')}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={enter.staggered(index)}>
              <OrderCard order={item} />
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
});
