/**
 * ProductListingScreen — filterable, sortable product grid. Reads optional `categoryId`,
 * `collectionId`, `query` and `family` route params. Category/search/all modes are one
 * server-side `/products` query (q + categoryId + family + sort); a collection is a
 * curated, unpaginated list, so family/sort are applied client-side only there.
 *
 * Layout: header (title + context) → a pinned toolbar that never scrolls away (scent
 * family chips with an "All" reset, result count and a Sort control showing the current
 * choice) → an editorial two-up grid with generous row spacing. Sort lives in a sheet.
 */
import { FlashList } from '@shopify/flash-list';
import { Check, ChevronDown, SearchX } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { BottomSheet, Chip, EmptyState, ErrorState, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useCategories, useCollectionProducts, useCollections, useProducts } from '@/hooks/queries';
import type { ProductListParams } from '@/services';
import type { Product, ScentFamily } from '@/types';
import { haptics } from '@/utils';

const COL_GAP = Spacing.md;
const ROW_GAP = Spacing.xxl;
const PAD = Layout.screenPadding;

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
const SORTS: { key: SortKey; label: string; short: string }[] = [
  { key: 'featured', label: 'Featured', short: 'Featured' },
  { key: 'priceAsc', label: 'Price: Low to High', short: 'Price ↑' },
  { key: 'priceDesc', label: 'Price: High to Low', short: 'Price ↓' },
  { key: 'rating', label: 'Top Rated', short: 'Top rated' },
];

const SORT_MAP: Record<SortKey, ProductListParams['sort']> = {
  featured: 'featured',
  priceAsc: 'price_asc',
  priceDesc: 'price_desc',
  rating: 'rating',
};

const FAMILIES: ScentFamily[] = ['oud', 'floral', 'amber', 'musk', 'woody', 'spicy'];

export function ProductListingScreen() {
  const { colors } = useTheme();
  const { width, gridColumns } = useResponsive();
  const params = useLocalSearchParams<{
    categoryId?: string;
    collectionId?: string;
    query?: string;
    family?: ScentFamily;
  }>();

  const [family, setFamily] = useState<ScentFamily | null>(
    FAMILIES.includes(params.family as ScentFamily) ? (params.family as ScentFamily) : null,
  );
  const [sort, setSort] = useState<SortKey>('featured');
  const [sortOpen, setSortOpen] = useState(false);

  const serverParams: ProductListParams = {
    family: family ?? undefined,
    sort: SORT_MAP[sort],
    categoryId: params.categoryId || undefined,
    q: params.query || undefined,
  };

  const isCollection = Boolean(params.collectionId);
  const catalog = useProducts(serverParams, !isCollection);
  const collection = useCollectionProducts(params.collectionId ?? '');
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const source = isCollection ? collection : catalog;
  const { isLoading, isError, refetch, isRefetching } = source;
  const fetchNextPage = isCollection ? undefined : catalog.fetchNextPage;
  const hasNextPage = isCollection ? false : catalog.hasNextPage;
  const isFetchingNextPage = isCollection ? false : catalog.isFetchingNextPage;

  const products = useMemo(() => {
    const list = [...(source.data ?? [])];
    if (!isCollection) return list;
    const filtered = family ? list.filter((p) => p.scentFamily === family) : list;
    switch (sort) {
      case 'priceAsc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [source.data, isCollection, family, sort]);

  const cardWidth = Math.floor((width - PAD * 2 - COL_GAP * (gridColumns - 1)) / gridColumns);
  const open = useCallback((p: Product) => router.push({ pathname: '/product/[id]', params: { id: p.id } }), []);

  const contextLabel = params.query
    ? 'Search'
    : params.collectionId
      ? 'Collection'
      : params.categoryId
        ? 'Category'
        : 'The Collection';
  const title = params.query
    ? `“${params.query}”`
    : params.collectionId
      ? (collections?.find((c) => c.id === params.collectionId)?.title ?? 'Collection')
      : params.categoryId
        ? (categories?.find((c) => c.id === params.categoryId)?.name ?? 'Category')
        : 'All Fragrances';

  const countLabel = isLoading
    ? ' '
    : `${products.length}${hasNextPage ? '+' : ''} ${products.length === 1 ? 'fragrance' : 'fragrances'}`;
  const activeSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  const selectFamily = (next: ScentFamily | null) => setFamily(next);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline={contextLabel} title={title} />

      {/* Pinned toolbar */}
      <View style={[styles.toolbar, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          accessibilityLabel="Filter by scent family"
        >
          <Chip label="All" selected={family === null} onPress={() => selectFamily(null)} />
          {FAMILIES.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={family === item}
              onPress={() => selectFamily(family === item ? null : item)}
            />
          ))}
        </ScrollView>
        <View style={styles.metaRow}>
          <Text variant="caption" color="muted" accessibilityLiveRegion="polite">
            {countLabel}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort by, currently ${activeSort.label}`}
            hitSlop={HitSlop}
            onPress={() => {
              haptics.selection();
              setSortOpen(true);
            }}
            style={({ pressed }) => [styles.sortBtn, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Text variant="label" color="muted" uppercase>
              Sort
            </Text>
            <Text variant="label" uppercase>
              {activeSort.short}
            </Text>
            <ChevronDown size={14} color={colors.text.primary} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      <FlashList
        data={isLoading ? [] : products}
        numColumns={gridColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: Spacing.xl, paddingBottom: Spacing.giant }}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage?.();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: gridColumns }).map((_, i) => (
                <ProductCardSkeleton key={i} width={cardWidth} />
              ))}
            </View>
          ) : !isLoading && products.length > 0 && !hasNextPage ? (
            <View style={styles.endMark}>
              <View style={[styles.endRule, { backgroundColor: colors.border }]} />
              <Text variant="overline" color="muted">
                END OF SELECTION
              </Text>
              <View style={[styles.endRule, { backgroundColor: colors.border }]} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: gridColumns * 2 }).map((_, i) => (
                <ProductCardSkeleton key={i} width={cardWidth} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon={<SearchX size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
              title={family ? `No ${family} fragrances here` : 'Nothing here yet'}
              message={
                family
                  ? 'Try another scent family, or clear the filter to see everything.'
                  : 'Browse the full collection to discover something new.'
              }
              actionLabel={family ? 'Clear filter' : 'Browse all'}
              onAction={family ? () => setFamily(null) : () => router.replace('/products')}
            />
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={enter.staggered(index % 6)}
            style={{
              width: cardWidth,
              marginBottom: ROW_GAP,
              marginLeft: index % gridColumns === 0 ? 0 : COL_GAP,
            }}
          >
            <ProductCard product={item} width={cardWidth} onPress={open} />
          </Animated.View>
        )}
      />

      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)}>
        <Text variant="overline" color="muted" style={styles.sheetEyebrow}>
          SORT BY
        </Text>
        <View accessibilityRole="radiogroup">
          {SORTS.map((option) => {
            const selected = sort === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  haptics.selection();
                  setSort(option.key);
                  setSortOpen(false);
                }}
                style={({ pressed }) => [
                  styles.sortRow,
                  { borderBottomColor: colors.divider, opacity: pressed ? 0.55 : 1 },
                ]}
              >
                <Text variant={selected ? 'bodyStrong' : 'body'} color={selected ? 'primary' : 'secondary'}>
                  {option.label}
                </Text>
                {selected ? <Check size={18} color={colors.accent} strokeWidth={1.75} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: Spacing.xs },
  chipRow: { gap: Spacing.sm, paddingHorizontal: PAD, paddingVertical: Spacing.md },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    minHeight: 40,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 40 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP },
  endMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  endRule: { flex: 1, height: StyleSheet.hairlineWidth },
  sheetEyebrow: { marginBottom: Spacing.sm },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
