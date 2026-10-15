/**
 * ProductListingScreen — filterable, sortable product grid. Reads optional `categoryId`,
 * `collectionId`, `query` and `family` route params. Category/search/all modes are one
 * server-side `/products` query (q + categoryId + family + sort); a collection is a
 * curated, unpaginated list, so family/sort are applied client-side only there.
 */
import { FlashList } from '@shopify/flash-list';
import { SlidersHorizontal } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { BottomSheet, Chip, EmptyState, ErrorState, IconButton, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useCategories, useCollectionProducts, useCollections, useProducts } from '@/hooks/queries';
import type { ProductListParams } from '@/services';
import type { Product, ScentFamily } from '@/types';

const GAP = Spacing.lg;
const PAD = Layout.screenPadding;

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'priceAsc', label: 'Price: Low to High' },
  { key: 'priceDesc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
];

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

  const SORT_MAP: Record<SortKey, ProductListParams['sort']> = {
    featured: 'featured',
    priceAsc: 'price_asc',
    priceDesc: 'price_desc',
    rating: 'rating',
  };
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

  const cardWidth = (width - PAD * 2 - GAP * (gridColumns - 1)) / gridColumns;
  const open = useCallback((p: Product) => router.push({ pathname: '/product/[id]', params: { id: p.id } }), []);

  const title = params.query
    ? `"${params.query}"`
    : params.collectionId
      ? (collections?.find((c) => c.id === params.collectionId)?.title ?? 'Collection')
      : params.categoryId
        ? (categories?.find((c) => c.id === params.categoryId)?.name ?? 'Category')
        : 'All Fragrances';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Browse"
        title={title}
        right={
          <IconButton onPress={() => setSortOpen(true)}>
            <SlidersHorizontal size={IconSize.md} color={colors.text.primary} strokeWidth={1.75} />
          </IconButton>
        }
      />

      <FlashList
        data={isLoading ? [] : products}
        numColumns={gridColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: Spacing.giant }}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage?.();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.skeletonGrid}>
              <ProductCardSkeleton width={cardWidth} />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.filters}>
            <FlashListChips active={family} onToggle={setFamily} />
            <Text variant="caption" color="muted" style={styles.count}>
              {isLoading ? 'Loading…' : `${products.length} fragrance${products.length === 1 ? '' : 's'}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} width={cardWidth} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="Nothing here yet"
              message="Try a different scent family or browse the full collection."
              actionLabel={family ? 'Clear filter' : undefined}
              onAction={family ? () => setFamily(null) : undefined}
            />
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={enter.staggered(index)}
            style={{ width: cardWidth, marginBottom: GAP, marginLeft: index % gridColumns === 0 ? 0 : GAP }}
          >
            <ProductCard product={item} width={cardWidth} onPress={open} />
          </Animated.View>
        )}
      />

      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)}>
        <Text variant="title" style={styles.sheetTitle}>
          Sort by
        </Text>
        {SORTS.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: sort === option.key }}
            onPress={() => {
              setSort(option.key);
              setSortOpen(false);
            }}
            style={[styles.sortRow, { borderBottomColor: colors.divider }]}
          >
            <Text variant="body" colorValue={sort === option.key ? colors.accent : colors.text.primary}>
              {option.label}
            </Text>
            {sort === option.key ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}

function FlashListChips({
  active,
  onToggle,
}: {
  active: ScentFamily | null;
  onToggle: (f: ScentFamily | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {FAMILIES.map((item) => (
        <Chip
          key={item}
          label={item}
          selected={active === item}
          onPress={() => onToggle(active === item ? null : item)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { gap: Spacing.xs, marginBottom: Spacing.md },
  chipRow: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  count: { paddingHorizontal: Spacing.xs },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  sheetTitle: { marginBottom: Spacing.md },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
