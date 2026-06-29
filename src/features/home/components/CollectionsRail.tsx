/**
 * CollectionsRail — horizontally scrolling editorial collection cards.
 */
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { CollectionCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useCollections } from '@/hooks/queries';
import type { Collection } from '@/types';

const CARD_WIDTH = 280;

export function CollectionsRail({ onSelect }: { onSelect?: (c: Collection) => void }) {
  const { data, isLoading } = useCollections();

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: Layout.screenPadding }}>
        <SectionHeader eyebrow="Curated" title="Featured Collections" />
      </View>

      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Layout.screenPadding }}>
          <Skeleton width={CARD_WIDTH} height={200} radius={Radius.lg} />
          <Skeleton width={120} height={200} radius={Radius.lg} />
        </View>
      ) : (
        <FlashList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Layout.screenPadding }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
          renderItem={({ item }) => <CollectionCard collection={item} width={CARD_WIDTH} onPress={onSelect} />}
        />
      )}
    </View>
  );
}
