/**
 * NewArrivalsGrid — a responsive two-up (or more on tablets) grid of the latest pieces.
 * Renders inside the Home ScrollView, so it uses flex-wrap rather than a nested list.
 * Hidden on error/empty so the page never shows a hole.
 */
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useNewArrivals } from '@/hooks/queries';
import type { Product } from '@/types';

const COL_GAP = Spacing.md;
const ROW_GAP = Spacing.xxl;
const PAD = Layout.screenPadding;

export function NewArrivalsGrid({
  onSelect,
  onSeeAll,
}: {
  onSelect?: (p: Product) => void;
  onSeeAll?: () => void;
}) {
  const { width, gridColumns } = useResponsive();
  const { data, isLoading, isError } = useNewArrivals();
  const cardWidth = Math.floor((width - PAD * 2 - COL_GAP * (gridColumns - 1)) / gridColumns);

  if (!isLoading && (isError || !data?.length)) return null;

  return (
    <View style={styles.root}>
      <View style={styles.pad}>
        <SectionHeader eyebrow="Just In" title="New Arrivals" actionLabel={onSeeAll ? 'View all' : undefined} onAction={onSeeAll} />
      </View>
      <View style={[styles.grid, styles.pad]}>
        {isLoading
          ? Array.from({ length: gridColumns * 2 }).map((_, i) => <ProductCardSkeleton key={i} width={cardWidth} />)
          : data?.map((product, index) => (
              <Animated.View key={product.id} entering={enter.staggered(index)} style={{ width: cardWidth }}>
                <ProductCard product={product} width={cardWidth} onPress={onSelect} />
              </Animated.View>
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  pad: { paddingHorizontal: PAD },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP },
});
