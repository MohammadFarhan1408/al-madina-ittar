/**
 * CategoryRail — horizontally scrolling list of category medallions with skeletons.
 */
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { CategoryCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useCategories } from '@/hooks/queries';
import type { Category } from '@/types';

export function CategoryRail({ onSelect }: { onSelect?: (category: Category) => void }) {
  const { data, isLoading } = useCategories();
  const size = Layout.categoryCardSize;

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ paddingHorizontal: Layout.screenPadding }}>
        <SectionHeader eyebrow="Explore" title="Scent Families" />
      </View>

      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Layout.screenPadding }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ alignItems: 'center', gap: Spacing.sm }}>
              <Skeleton width={size} height={size} radius={size / 2} />
              <Skeleton width={56} height={10} />
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Layout.screenPadding }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
          renderItem={({ item }) => <CategoryCard category={item} onPress={onSelect} />}
        />
      )}
    </View>
  );
}
