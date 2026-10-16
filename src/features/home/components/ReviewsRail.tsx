/**
 * ReviewsRail — customer testimonials, sourced live from the top best-sellers (the
 * backend only exposes reviews per product). Hidden when there is nothing to show so a
 * failed/empty fetch never leaves a blank section.
 */
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ReviewCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Layout, Spacing } from '@/constants';
import { useHomeReviews } from '@/hooks/queries';

const GAP = Spacing.md;

export function ReviewsRail() {
  const { data } = useHomeReviews();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.round(width * 0.78), 340);
  if (!data?.length) return null;

  return (
    <View style={styles.root}>
      <View style={styles.pad}>
        <SectionHeader eyebrow="In Their Words" title="Loved by Connoisseurs" />
      </View>
      <FlashList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + GAP}
        contentContainerStyle={styles.pad}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => <ReviewCard review={item} width={cardWidth} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  pad: { paddingHorizontal: Layout.screenPadding },
  sep: { width: GAP },
});
