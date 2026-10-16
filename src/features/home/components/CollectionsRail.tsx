/**
 * CollectionsRail — portrait editorial collection cards that snap one at a time, with
 * the next card peeking to invite the swipe. Hidden on error/empty.
 */
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CollectionCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useCollections } from '@/hooks/queries';
import type { Collection } from '@/types';

const GAP = Spacing.md;

export function CollectionsRail({ onSelect }: { onSelect?: (c: Collection) => void }) {
  const { data, isLoading, isError } = useCollections();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.round(width * 0.74), 340);
  const cardHeight = Math.round(cardWidth * 1.28);

  if (!isLoading && (isError || !data?.length)) return null;

  return (
    <View style={styles.root}>
      <View style={styles.pad}>
        <SectionHeader eyebrow="Curated" title="The Collections" />
      </View>

      {isLoading ? (
        <View style={[styles.row, styles.pad]}>
          <Skeleton width={cardWidth} height={cardHeight} radius={Radius.sm} />
          <Skeleton width={60} height={cardHeight} radius={Radius.sm} />
        </View>
      ) : (
        <FlashList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + GAP}
          snapToAlignment="start"
          contentContainerStyle={styles.pad}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <CollectionCard collection={item} width={cardWidth} height={cardHeight} onPress={onSelect} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  pad: { paddingHorizontal: Layout.screenPadding },
  row: { flexDirection: 'row', gap: GAP, overflow: 'hidden' },
  sep: { width: GAP },
});
