/**
 * ReviewsRail — horizontally scrolling customer reviews, sourced live from the top
 * best-sellers (the backend only exposes reviews per product). Hidden when there is
 * nothing to show so a failed/empty fetch never leaves a blank section.
 */
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { ReviewCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import { useHomeReviews } from '@/hooks/queries';

const CARD_WIDTH = 300;

export function ReviewsRail() {
  const { data } = useHomeReviews();
  if (!data?.length) return null;

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: Layout.screenPadding }}>
        <SectionHeader eyebrow="Testimonials" title="Loved by Connoisseurs" />
      </View>
      <FlashList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Layout.screenPadding }}
        ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
        renderItem={({ item }) => <ReviewCard review={item} width={CARD_WIDTH} />}
      />
    </View>
  );
}
