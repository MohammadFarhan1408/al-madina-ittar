/**
 * NewArrivalsGrid — responsive wrapped grid of ProductCards (renders inside the Home
 * ScrollView, so it uses flex-wrap rather than a nested vertical list).
 */
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/animations';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useNewArrivals } from '@/hooks/queries';
import type { Product } from '@/types';

const GAP = Spacing.lg;
const PAD = Layout.screenPadding;

export function NewArrivalsGrid({ onSelect }: { onSelect?: (p: Product) => void }) {
  const { width, gridColumns } = useResponsive();
  const { data, isLoading } = useNewArrivals();
  const cardWidth = (width - PAD * 2 - GAP * (gridColumns - 1)) / gridColumns;

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: PAD }}>
        <SectionHeader eyebrow="Just In" title="New Arrivals" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: PAD }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} width={cardWidth} />)
          : data?.map((product, index) => (
              <Animated.View key={product.id} entering={enter.staggered(index)} style={{ width: cardWidth }}>
                <ProductCard product={product} width={cardWidth} onPress={onSelect} />
              </Animated.View>
            ))}
      </View>
    </View>
  );
}
