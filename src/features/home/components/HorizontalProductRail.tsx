/**
 * HorizontalProductRail — a titled, horizontally-scrolling rail of ProductCards used for
 * Signature, Best Sellers and Seasonal sections. Presentational; data comes from props.
 */
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import type { Product } from '@/types';

const CARD_WIDTH = 200;

export function HorizontalProductRail({
  eyebrow,
  title,
  products,
  isLoading,
  onSeeAll,
  onSelect,
}: {
  eyebrow: string;
  title: string;
  products?: Product[];
  isLoading: boolean;
  onSeeAll?: () => void;
  onSelect?: (product: Product) => void;
}) {
  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: Layout.screenPadding }}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          actionLabel={onSeeAll ? 'See all' : undefined}
          onAction={onSeeAll}
        />
      </View>

      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Layout.screenPadding }}>
          <ProductCardSkeleton width={CARD_WIDTH} />
          <ProductCardSkeleton width={CARD_WIDTH} />
        </View>
      ) : (
        <FlashList
          horizontal
          data={products}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Layout.screenPadding }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
          renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} onPress={onSelect} />}
        />
      )}
    </View>
  );
}
