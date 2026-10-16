/**
 * SearchScreen (modal) — a calm, typographic search.
 *
 * Idle: recent searches as removable rows, trending terms as a numbered editorial list,
 * and scent families that deep-link into the listing's real `family` filter.
 * Typing: live suggestions (with the typed part emphasised) above a debounced results
 * grid with a result count. Loading → skeletons; error → retry; no match → guidance.
 * Recent terms persist (search store).
 *
 * Presented as an iOS sheet: a grabber handle sits at the top and the sheet is dismissed
 * by swiping down (no Cancel button). The sheet already clears the status bar, so the
 * top safe-area inset is only applied where the screen is full-screen (Android/web).
 */
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ArrowUpLeft, Clock, Search as SearchIcon, SearchX, X } from 'lucide-react-native';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { Chip, EmptyState, ErrorState, SearchBar, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchProducts, useSearchSuggestions, useTrendingSearches } from '@/hooks/queries';
import { useSearchStore } from '@/store';
import type { Product, ScentFamily } from '@/types';
import { haptics } from '@/utils';

const COL_GAP = Spacing.md;
const ROW_GAP = Spacing.xxl;
const PAD = Layout.screenPadding;
const FAMILIES: ScentFamily[] = ['oud', 'floral', 'amber', 'musk', 'woody', 'spicy'];
/** iOS presents `search` as a swipe-to-dismiss sheet (see app/_layout.tsx). */
const IS_SHEET = Platform.OS === 'ios';

export function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, gridColumns } = useResponsive();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 350);
  const suggestQuery = useDebounce(query, 250);
  const { data: suggestions } = useSearchSuggestions(suggestQuery);
  const { data: trending } = useTrendingSearches();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchProducts(debounced);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const removeRecent = useSearchStore((s) => s.removeRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const cardWidth = Math.floor((width - PAD * 2 - COL_GAP * (gridColumns - 1)) / gridColumns);
  const term = debounced.trim();
  const hasQuery = term.length > 0;
  const results = data ?? [];
  const visibleSuggestions = (suggestions ?? [])
    .filter((s) => s.toLowerCase() !== term.toLowerCase())
    .slice(0, 4);

  const open = (p: Product) => {
    addRecent(debounced);
    router.push({ pathname: '/product/[id]', params: { id: p.id } });
  };

  const runTerm = (next: string) => {
    haptics.selection();
    setQuery(next);
    addRecent(next);
    Keyboard.dismiss();
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background, paddingTop: IS_SHEET ? 0 : insets.top + Spacing.sm },
      ]}
    >
      {IS_SHEET ? (
        <View style={styles.grabberZone} accessibilityElementsHidden importantForAccessibility="no">
          <View style={[styles.grabber, { backgroundColor: colors.borderStrong }]} />
        </View>
      ) : null}
      <View style={styles.searchRow}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus onSubmit={() => addRecent(query)} />
      </View>

      {!hasQuery ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.idle, { paddingBottom: insets.bottom + Spacing.giant }]}
        >
          {recent.length > 0 ? (
            <Animated.View entering={FadeIn.duration(250)} style={styles.block}>
              <View style={styles.blockHeader}>
                <Text variant="overline" color="muted">
                  RECENT
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear all recent searches"
                  hitSlop={HitSlop}
                  onPress={clearRecent}
                  style={styles.minTouch}
                >
                  <Text variant="label" color="secondary" uppercase>
                    Clear all
                  </Text>
                </Pressable>
              </View>
              <View>
                {recent.map((item) => (
                  <View key={item} style={[styles.row, { borderBottomColor: colors.divider }]}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${item}`}
                      onPress={() => runTerm(item)}
                      style={({ pressed }) => [styles.rowMain, { opacity: pressed ? 0.5 : 1 }]}
                    >
                      <Clock size={15} color={colors.text.muted} strokeWidth={1.5} />
                      <Text variant="body" numberOfLines={1} style={styles.flex}>
                        {item}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item} from recent searches`}
                      onPress={() => removeRecent(item)}
                      style={({ pressed }) => [styles.rowAction, { opacity: pressed ? 0.5 : 1 }]}
                    >
                      <X size={15} color={colors.text.muted} strokeWidth={1.5} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {trending?.length ? (
            <Animated.View entering={FadeIn.delay(80).duration(250)} style={styles.block}>
              <Text variant="overline" color="accent">
                TRENDING NOW
              </Text>
              <View>
                {trending.slice(0, 6).map((item, i) => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${item}`}
                    onPress={() => runTerm(item)}
                    style={({ pressed }) => [
                      styles.row,
                      styles.rowGap,
                      { borderBottomColor: colors.divider, opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Text variant="caption" color="muted" style={styles.rank}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <Text variant="title" numberOfLines={1} style={[styles.flex, styles.trendTerm]}>
                      {item}
                    </Text>
                    <ArrowUpLeft size={15} color={colors.text.muted} strokeWidth={1.5} />
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeIn.delay(160).duration(250)} style={styles.block}>
            <Text variant="overline" color="muted">
              BROWSE BY SCENT FAMILY
            </Text>
            <View style={styles.chips}>
              {FAMILIES.map((family) => (
                <Chip
                  key={family}
                  label={family}
                  onPress={() => router.push({ pathname: '/products', params: { family } })}
                />
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      ) : (
        <FlashList
          data={isLoading ? [] : results}
          numColumns={gridColumns}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: insets.bottom + Spacing.giant }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              {visibleSuggestions.length > 0 ? (
                <View>
                  {visibleSuggestions.map((s) => (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${s}`}
                      onPress={() => runTerm(s)}
                      style={({ pressed }) => [
                        styles.row,
                        styles.rowGap,
                        { borderBottomColor: colors.divider, opacity: pressed ? 0.5 : 1 },
                      ]}
                    >
                      <SearchIcon size={14} color={colors.text.muted} strokeWidth={1.5} />
                      <Highlighted text={s} match={term} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {!isLoading && !isError && results.length > 0 ? (
                <Text variant="overline" color="muted" accessibilityLiveRegion="polite">
                  {results.length}
                  {hasNextPage ? '+' : ''} {results.length === 1 ? 'RESULT' : 'RESULTS'} FOR “{term.toUpperCase()}”
                </Text>
              ) : null}
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: gridColumns }).map((_, i) => (
                  <ProductCardSkeleton key={i} width={cardWidth} />
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : isLoading ? (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: gridColumns * 2 }).map((_, i) => (
                  <ProductCardSkeleton key={i} width={cardWidth} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<SearchX size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
                title="No matches"
                message={`Nothing found for “${term}”. Try a note like oud or rose, or browse the full collection.`}
                actionLabel="Browse all fragrances"
                onAction={() => router.push('/products')}
              />
            )
          }
          renderItem={({ item, index }) => (
            <View
              style={{
                width: cardWidth,
                marginBottom: ROW_GAP,
                marginLeft: index % gridColumns === 0 ? 0 : COL_GAP,
              }}
            >
              <ProductCard product={item} width={cardWidth} onPress={open} />
            </View>
          )}
        />
      )}
    </View>
  );
}

/** Renders a suggestion with the typed prefix in ink and the remainder muted. */
function Highlighted({ text, match }: { text: string; match: string }) {
  const at = text.toLowerCase().indexOf(match.toLowerCase());
  if (!match || at < 0) {
    return (
      <Text variant="body" numberOfLines={1} style={styles.flex}>
        {text}
      </Text>
    );
  }
  return (
    <Text variant="body" color="secondary" numberOfLines={1} style={styles.flex}>
      {text.slice(0, at)}
      <Text variant="bodyStrong" color="primary">
        {text.slice(at, at + match.length)}
      </Text>
      {text.slice(at + match.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  grabberZone: { alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  grabber: { width: 36, height: 4, borderRadius: 2, opacity: 0.6 },
  searchRow: { paddingHorizontal: PAD, paddingBottom: Spacing.md },
  idle: { paddingHorizontal: PAD, paddingTop: Spacing.lg, gap: Spacing.huge },
  block: { gap: Spacing.md },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  minTouch: { minHeight: 44, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 52 },
  rowGap: { gap: Spacing.md },
  rowAction: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  rank: { width: 22, letterSpacing: 1 },
  trendTerm: { fontSize: 18, lineHeight: 24, textTransform: 'capitalize' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  resultsHeader: { gap: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP },
});
