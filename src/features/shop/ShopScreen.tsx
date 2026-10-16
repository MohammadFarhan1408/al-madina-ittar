/**
 * ShopScreen (Shop tab) — the catalogue's front door.
 *
 * Editorial header with a search entry point, a scent-family strip (deep-links into the
 * listing's real `family` filter), an "All fragrances" feature row, then a portrait
 * two-up grid of categories (three-up on tablets). Loading → matching skeletons,
 * error → retry, empty → quiet message. Pull to refresh.
 */
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { enter } from '@/animations';
import { CategoryTile } from '@/components/commerce';
import { Chip, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useCategories } from '@/hooks/queries';
import type { Category, ScentFamily } from '@/types';

const COL_GAP = Spacing.md;
const ROW_GAP = Spacing.md;
const PAD = Layout.screenPadding;
const FAMILIES: ScentFamily[] = ['oud', 'floral', 'amber', 'musk', 'woody', 'spicy'];

export function ShopScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isTablet } = useResponsive();
  const { data, isLoading, isError, refetch, isRefetching } = useCategories();

  const columns = isTablet ? 3 : 2;
  const tileWidth = Math.floor((width - PAD * 2 - COL_GAP * (columns - 1)) / columns);

  const open = useCallback(
    (category: Category) => router.push({ pathname: '/products', params: { categoryId: category.id } }),
    [],
  );

  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.titleBlock}>
        <Text variant="overline" color="accent">
          AL MADINA · THE COLLECTION
        </Text>
        <Text variant="display" accessibilityRole="header">
          Shop
        </Text>
      </View>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Search fragrances"
        onPress={() => router.push('/search')}
        style={({ pressed }) => [
          styles.searchEntry,
          { backgroundColor: colors.surfaceSunken, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Search size={17} color={colors.text.secondary} strokeWidth={1.5} />
        <Text variant="body" color="muted">
          Search fragrances, notes…
        </Text>
      </Pressable>

      <View style={styles.familyBlock}>
        <Text variant="overline" color="muted">
          BY SCENT FAMILY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.bleed}
        >
          {FAMILIES.map((family) => (
            <Chip
              key={family}
              label={family}
              onPress={() => router.push({ pathname: '/products', params: { family } })}
            />
          ))}
        </ScrollView>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Browse all fragrances"
        onPress={() => router.push('/products')}
        style={({ pressed }) => [styles.allRow, { borderColor: colors.divider, opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={styles.allText}>
          <Text variant="title">All Fragrances</Text>
          <Text variant="caption" color="secondary">
            The complete wardrobe of ittars and parfums
          </Text>
        </View>
        <View style={[styles.arrow, { borderColor: colors.borderStrong }]}>
          <ArrowRight size={16} color={colors.text.primary} strokeWidth={1.5} />
        </View>
      </Pressable>

      <Text variant="overline" color="muted" style={styles.gridLabel}>
        CATEGORIES
      </Text>
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
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <Skeleton key={i} width={tileWidth} height={Math.round(tileWidth * 1.25)} radius={Radius.sm} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="The atelier is preparing"
              message="New categories are on their way. Meanwhile, browse every fragrance."
              actionLabel="All fragrances"
              onAction={() => router.push('/products')}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: Layout.tabBarClearance + Spacing.lg }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={enter.staggered(index)}
            style={{
              width: tileWidth,
              marginBottom: ROW_GAP,
              marginLeft: index % columns === 0 ? 0 : COL_GAP,
            }}
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
  header: { gap: Spacing.xxl, paddingBottom: Spacing.lg },
  titleBlock: { gap: Spacing.xs },
  searchEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  familyBlock: { gap: Spacing.md },
  bleed: { marginHorizontal: -PAD },
  chipRow: { gap: Spacing.sm, paddingHorizontal: PAD, paddingVertical: Spacing.xs },
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  allText: { flex: 1, gap: 2 },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { marginBottom: -Spacing.sm },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP },
});
