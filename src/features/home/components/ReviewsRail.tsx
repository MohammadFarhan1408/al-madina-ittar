/**
 * ReviewsRail — horizontally scrolling customer testimonials.
 * ponytail: decorative testimonial rail, no backend equivalent (backend only exposes
 * reviews per-product, not a cross-product "recent reviews" feed) — stays mock-sourced.
 */
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { ReviewCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import { mockReviews } from '@/services/mock/reviews.mock';

const CARD_WIDTH = 300;

export function ReviewsRail() {
  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: Layout.screenPadding }}>
        <SectionHeader eyebrow="Testimonials" title="Loved by Connoisseurs" />
      </View>
      <FlashList
        horizontal
        data={mockReviews}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Layout.screenPadding }}
        ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
        renderItem={({ item }) => <ReviewCard review={item} width={CARD_WIDTH} />}
      />
    </View>
  );
}
