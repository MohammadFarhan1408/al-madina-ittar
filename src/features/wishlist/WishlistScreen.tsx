/**
 * WishlistScreen (Saved tab) — the shopper's saved pieces, resolved from the wishlist
 * store. Tapping opens details; the card's heart removes.
 *
 * Header (title + count) with a single "Add all to bag" action (in-stock pieces not
 * already in the bag — same rule as before, now shown with its count), then the grid.
 * States: skeletons while loading, error with retry, an editorial empty state, and a
 * quiet note when saved pieces are no longer available (with a one-tap tidy-up).
 */
import { FlashList } from '@shopify/flash-list';
import { Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { enter } from '@/animations';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { Button, EmptyState, ErrorState, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useProductsByIds } from '@/hooks/queries';
import { toast, useCartStore, useWishlistStore } from '@/store';
import { defaultVariant, haptics } from '@/utils';
import type { Product } from '@/types';

const COL_GAP = Spacing.md;
const ROW_GAP = Spacing.xxl;
const PAD = Layout.screenPadding;

export function WishlistScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, gridColumns } = useResponsive();
  const ids = useWishlistStore((s) => s.ids);
  const removeId = useWishlistStore((s) => s.remove);
  const cartItems = useCartStore((s) => s.items);
  const { data, isLoading, isError, refetch } = useProductsByIds(ids);

  const cardWidth = Math.floor((width - PAD * 2 - COL_GAP * (gridColumns - 1)) / gridColumns);

  const addable = useMemo(() => {
    const inCart = new Set(cartItems.map((i) => i.product.id));
    return (data ?? []).filter((p) => p.inStock && !inCart.has(p.id));
  }, [data, cartItems]);

  const missing = useMemo(
    () => (data && !isLoading ? ids.filter((id) => !data.some((p) => p.id === id)) : []),
    [data, ids, isLoading],
  );

  const addAllToCart = () => {
    addable.forEach((p) => useCartStore.getState().addItem(p, 1, defaultVariant(p)?.volumeMl));
    haptics.success();
    toast.success(addable.length ? `${addable.length} added to your bag` : 'Everything available is already in your bag');
    router.push('/(tabs)/cart');
  };
  const open = (p: Product) => router.push({ pathname: '/product/[id]', params: { id: p.id } });

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.titleBlock}>
        <Text variant="overline" color="accent">
          {ids.length > 0 ? `${ids.length} ${ids.length === 1 ? 'PIECE' : 'PIECES'} SAVED` : 'YOUR FAVOURITES'}
        </Text>
        <Text variant="display" accessibilityRole="header">
          Saved
        </Text>
      </View>

      {!isLoading && !isError && (data?.length ?? 0) > 0 ? (
        <Button
          label={addable.length > 0 ? `Add ${addable.length > 1 ? `all ${addable.length}` : '1'} to bag` : 'All in your bag'}
          variant="outline"
          disabled={addable.length === 0}
          onPress={addAllToCart}
        />
      ) : null}

      {missing.length > 0 ? (
        <View style={[styles.note, { borderColor: colors.border }]}>
          <Text variant="caption" color="secondary" style={styles.flex}>
            {missing.length} saved {missing.length === 1 ? 'piece is' : 'pieces are'} no longer available.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove unavailable pieces from saved"
            hitSlop={HitSlop}
            onPress={() => missing.forEach((id) => removeId(id))}
            style={styles.noteAction}
          >
            <Text variant="label" uppercase style={styles.underline}>
              Remove
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (ids.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.pad}>{header}</View>
        <EmptyState
          icon={<Heart size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
          title="Nothing saved yet"
          message="Tap the heart on any fragrance to keep it here — your shortlist for later."
          actionLabel="Discover the collection"
          actionVariant="primary"
          onAction={() => router.push('/(tabs)/shop')}
          style={{ paddingBottom: Layout.tabBarClearance }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlashList
        data={isLoading || isError ? [] : data}
        numColumns={gridColumns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={() => refetch()}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: Layout.tabBarClearance + Spacing.lg }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: Math.min(ids.length, gridColumns * 2) }).map((_, i) => (
                <ProductCardSkeleton key={i} width={cardWidth} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={enter.staggered(index % 8)}
            style={{ width: cardWidth, marginBottom: ROW_GAP, marginLeft: index % gridColumns === 0 ? 0 : COL_GAP }}
          >
            <ProductCard product={item} width={cardWidth} onPress={open} />
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  pad: { paddingHorizontal: PAD },
  header: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  titleBlock: { gap: Spacing.xs },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.md,
  },
  noteAction: { minHeight: 44, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP },
});
