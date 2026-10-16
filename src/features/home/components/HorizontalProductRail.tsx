/**
 * HorizontalProductRail — a titled, horizontally-scrolling rail of ProductCards used for
 * Signature, Best Sellers and Seasonal sections. Presentational; data comes from props.
 * Loading → skeletons; error with nothing cached → inline retry; empty → hidden.
 */
import { FlashList } from '@shopify/flash-list';
import { RotateCw } from 'lucide-react-native';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ProductCard, ProductCardSkeleton } from '@/components/commerce';
import { SectionHeader } from '@/components/layout';
import { Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Product } from '@/types';

const GAP = Spacing.lg;

export function HorizontalProductRail({
  eyebrow,
  title,
  products,
  isLoading,
  isError = false,
  onRetry,
  onSeeAll,
  onSelect,
}: {
  eyebrow: string;
  title: string;
  products?: Product[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSeeAll?: () => void;
  onSelect?: (product: Product) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // ~2.3 cards visible on phones so the rail clearly scrolls; capped on tablets.
  const cardWidth = Math.min(Math.round((width - Layout.screenPadding) / 2.3), 220);

  if (!isLoading && !isError && !products?.length) return null;

  return (
    <View style={styles.root}>
      <View style={styles.pad}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          actionLabel={onSeeAll ? 'View all' : undefined}
          onAction={onSeeAll}
        />
      </View>

      {isLoading ? (
        <View style={[styles.row, styles.pad]}>
          <ProductCardSkeleton width={cardWidth} />
          <ProductCardSkeleton width={cardWidth} />
          <ProductCardSkeleton width={cardWidth} />
        </View>
      ) : isError && !products?.length ? (
        <View style={styles.pad}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Couldn't load ${title}. Retry`}
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retry,
              { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text variant="caption" color="secondary" style={styles.retryText}>
              {"Couldn't load this collection right now."}
            </Text>
            <View style={styles.retryAction}>
              <RotateCw size={13} color={colors.text.primary} strokeWidth={1.5} />
              <Text variant="label" uppercase>
                Retry
              </Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <FlashList
          horizontal
          data={products}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pad}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => <ProductCard product={item} width={cardWidth} onPress={onSelect} />}
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
  retry: {
    minHeight: 64,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  retryText: { flex: 1 },
  retryAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 44 },
});
