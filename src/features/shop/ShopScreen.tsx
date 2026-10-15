/**
 * ShopScreen (Categories tab) — editorial grid of category tiles with a luxe in-screen
 * header. Tapping a tile opens the filtered Product Listing.
 */
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { enter } from '@/animations';
import { ArtDecoDivider } from '@/components/brand';
import { CategoryTile } from '@/components/commerce';
import { EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useCategories } from '@/hooks/queries';
import type { Category } from '@/types';

const GAP = Spacing.lg;
const PAD = Layout.screenPadding;

export function ShopScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isTablet } = useResponsive();
  const { data, isLoading, isError, refetch, isRefetching } = useCategories();

  const columns = isTablet ? 3 : 2;
  const tileWidth = (width - PAD * 2 - GAP * (columns - 1)) / columns;

  const open = useCallback(
    (category: Category) => router.push({ pathname: '/products', params: { categoryId: category.id } }),
    [],
  );

  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
      <Text variant="overline" color="accent" align="center">
        AL MADINA
      </Text>
      <Text variant="display" align="center">
        The Collection
      </Text>
      <ArtDecoDivider label="EXPLORE BY FAMILY" />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlashList
        data={isLoading ? [] : data}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          isLoading ? null : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState title="No collections yet" message="New fragrances are being prepared. Please check back soon." />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: Layout.tabBarClearance }}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width={tileWidth} height={170} radius={Radius.lg} />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={enter.staggered(index)}
            style={{ width: tileWidth, marginBottom: GAP, marginLeft: index % columns === 0 ? 0 : GAP }}
          >
            <CategoryTile category={item} width={tileWidth} onPress={open} />
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: Spacing.sm, paddingBottom: Spacing.xxl, alignItems: 'center' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
