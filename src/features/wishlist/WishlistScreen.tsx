/**
 * WishlistScreen (tab) — grid of saved products resolved from the wishlist store. Empty
 * state invites browsing. Tapping opens details; the card's heart removes from wishlist.
 */
import { FlashList } from '@shopify/flash-list';
import { HeartCrack } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { enter } from '@/animations';
import { ArtDecoDivider } from '@/components/brand';
import { ProductCard } from '@/components/commerce';
import { Button, EmptyState, Loader, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useProductsByIds } from '@/hooks/queries';
import { toast, useCartStore, useWishlistStore } from '@/store';
import { defaultVariant, haptics } from '@/utils';
import type { Product } from '@/types';

const GAP = Spacing.lg;
const PAD = Layout.screenPadding;

export function WishlistScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, gridColumns } = useResponsive();
  const ids = useWishlistStore((s) => s.ids);
  const { data, isLoading } = useProductsByIds(ids);

  const cardWidth = (width - PAD * 2 - GAP * (gridColumns - 1)) / gridColumns;
  const addAllToCart = () => {
    const inCart = new Set(useCartStore.getState().items.map((i) => i.product.id));
    const addable = (data ?? []).filter((p) => p.inStock && !inCart.has(p.id));
    addable.forEach((p) => useCartStore.getState().addItem(p, 1, defaultVariant(p)?.volumeMl));
    haptics.success();
    toast.success(addable.length ? `${addable.length} added to your bag` : 'Everything available is already in your bag');
    router.push('/(tabs)/cart');
  };
  const open = (p: Product) => router.push({ pathname: '/product/[id]', params: { id: p.id } });

  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
      <Text variant="overline" color="accent" align="center">
        YOUR FAVOURITES
      </Text>
      <Text variant="display" align="center">
        Wishlist
      </Text>
      <ArtDecoDivider label={`${ids.length} SAVED`} />
    </View>
  );

  if (ids.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {Header}
        <EmptyState
          icon={<HeartCrack size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
          title="No saved scents yet"
          message="Tap the heart on any fragrance to keep it here for later."
          actionLabel="Browse the collection"
          onAction={() => router.push('/(tabs)/shop')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlashList
        data={isLoading ? [] : data}
        numColumns={gridColumns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: Layout.tabBarClearance }}
        ListEmptyComponent={isLoading ? <Loader /> : null}
        ListFooterComponent={
          !isLoading && data && data.length > 0 ? (
            <Button label="Add all to bag" variant="outline" onPress={addAllToCart} style={styles.footerBtn} />
          ) : null
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: Spacing.sm, paddingBottom: Spacing.xxl, alignItems: 'center' },
  footerBtn: { marginTop: Spacing.lg },
});
