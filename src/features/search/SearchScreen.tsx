/**
 * SearchScreen (modal) — autofocused search with recent & trending chips, debounced
 * results grid, and luxe empty/loading states. Persists recent terms.
 */
import { FlashList } from '@shopify/flash-list';
import { Clock, Sparkles, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { Chip, EmptyState, SearchBar, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchProducts } from '@/hooks/queries';
import { useSearchStore } from '@/store';
import type { Product } from '@/types';

const TRENDING = ['Oud', 'Rose', 'Amber', 'Saffron', 'Musk'];
const GAP = Spacing.lg;
const PAD = Layout.screenPadding;

export function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, gridColumns } = useResponsive();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 350);
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchProducts(debounced);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const cardWidth = (width - PAD * 2 - GAP * (gridColumns - 1)) / gridColumns;
  const hasQuery = debounced.trim().length > 0;

  const open = (p: Product) => {
    addRecent(debounced);
    router.push({ pathname: '/product/[id]', params: { id: p.id } });
  };

  const runTerm = (term: string) => {
    setQuery(term);
    addRecent(term);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.searchRow}>
        <View style={styles.flex}>
          <SearchBar value={query} onChangeText={setQuery} autoFocus onSubmit={() => addRecent(query)} />
        </View>
        <Pressable hitSlop={HitSlop} onPress={() => router.back()}>
          <Text variant="button" color="accent" uppercase>
            Cancel
          </Text>
        </Pressable>
      </View>

      {!hasQuery ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.suggestions}>
          {recent.length > 0 ? (
            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <View style={styles.blockTitle}>
                  <Clock size={IconSize.sm} color={colors.text.secondary} strokeWidth={1.75} />
                  <Text variant="overline" color="secondary">
                    RECENT
                  </Text>
                </View>
                <Pressable hitSlop={HitSlop} onPress={clearRecent}>
                  <Text variant="label" color="muted" uppercase>
                    Clear
                  </Text>
                </Pressable>
              </View>
              <View style={styles.chips}>
                {recent.map((term) => (
                  <Chip key={term} label={term} onPress={() => runTerm(term)} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.block}>
            <View style={styles.blockTitle}>
              <Sparkles size={IconSize.sm} color={colors.accent} strokeWidth={1.75} />
              <Text variant="overline" color="accent">
                TRENDING
              </Text>
            </View>
            <View style={styles.chips}>
              {TRENDING.map((term) => (
                <Chip key={term} label={term} onPress={() => runTerm(term)} />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlashList
          data={isLoading || isFetching ? [] : data}
          numColumns={gridColumns}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: Spacing.lg, paddingBottom: Spacing.giant }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListEmptyComponent={
            isLoading || isFetching ? (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} width={cardWidth} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<X size={IconSize.xxl} color={colors.text.muted} strokeWidth={1.5} />}
                title="No matches"
                message={`We couldn't find anything for "${debounced}". Try another scent or note.`}
              />
            )
          }
          renderItem={({ item, index }) => (
            <View style={{ width: cardWidth, marginBottom: GAP, marginLeft: index % gridColumns === 0 ? 0 : GAP }}>
              <ProductCard product={item} width={cardWidth} onPress={open} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: PAD, paddingBottom: Spacing.md },
  flex: { flex: 1 },
  suggestions: { padding: PAD, gap: Spacing.xxl },
  block: { gap: Spacing.md },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
