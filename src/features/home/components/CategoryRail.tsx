/**
 * CategoryRail — scent-family medallions in a horizontal rail, with matching skeletons.
 * Hidden entirely if the request fails and nothing is cached (the page stays clean).
 */
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, View } from 'react-native';

import { CategoryCard } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useCategories } from '@/hooks/queries';
import type { Category } from '@/types';

const SIZE = Layout.categoryCardSize;

export function CategoryRail({
  onSelect,
  onSeeAll,
}: {
  onSelect?: (category: Category) => void;
  onSeeAll?: () => void;
}) {
  const { data, isLoading, isError } = useCategories();
  if (!isLoading && (isError || !data?.length)) return null;

  return (
    <View style={styles.root}>
      <View style={styles.pad}>
        <SectionHeader eyebrow="Explore" title="Scent Families" actionLabel="All" onAction={onSeeAll} />
      </View>

      {isLoading ? (
        <View style={[styles.row, styles.pad]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.skeleton}>
              <Skeleton width={SIZE} height={SIZE} radius={SIZE / 2} />
              <Skeleton width={52} height={8} />
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pad}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => <CategoryCard category={item} onPress={onSelect} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  pad: { paddingHorizontal: Layout.screenPadding },
  row: { flexDirection: 'row', gap: Spacing.xl },
  skeleton: { alignItems: 'center', gap: Spacing.md },
  sep: { width: Spacing.xl },
});
