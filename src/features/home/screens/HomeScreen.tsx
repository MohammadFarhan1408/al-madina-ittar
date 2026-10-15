/**
 * HomeScreen — the luxury storefront. A single Animated.ScrollView drives the parallax
 * hero and a floating glass header that fades in on scroll. Sections: Hero → Categories →
 * Featured Collections → Signature → Best Sellers → Exclusive Offer → New Arrivals →
 * Seasonal → Reviews → Brand Story.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useScrollY } from '@/animations';
import { OfferBanner } from '@/components/commerce';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useBestSellers, useSeasonal, useSignature } from '@/hooks/queries';
import { router } from 'expo-router';
import type { Category, Collection, Product } from '@/types';
import { BrandStory } from '../components/BrandStory';
import { CategoryRail } from '../components/CategoryRail';
import { CollectionsRail } from '../components/CollectionsRail';
import { FloatingHeader } from '../components/FloatingHeader';
import { HomeHero } from '../components/HomeHero';
import { HorizontalProductRail } from '../components/HorizontalProductRail';
import { NewArrivalsGrid } from '../components/NewArrivalsGrid';
import { ReviewsRail } from '../components/ReviewsRail';

export function HomeScreen() {
  const { scrollY, handler } = useScrollY();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const signature = useSignature();
  const bestSellers = useBestSellers();
  const seasonal = useSeasonal();

  const openProduct = useCallback(
    (product: Product) => router.push({ pathname: '/product/[id]', params: { id: product.id } }),
    [],
  );
  const openCategory = useCallback(
    (category: Category) => router.push({ pathname: '/products', params: { categoryId: category.id } }),
    [],
  );
  const openCollection = useCallback(
    (collection: Collection) => router.push({ pathname: '/products', params: { collectionId: collection.id } }),
    [],
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ type: 'active' }).catch(() => undefined);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <View style={styles.root}>
      <FloatingHeader scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <HomeHero scrollY={scrollY} />

        <View style={styles.sections}>
          <CategoryRail onSelect={openCategory} />
          <CollectionsRail onSelect={openCollection} />
          <HorizontalProductRail
            eyebrow="Iconic"
            title="Signature Ittars"
            products={signature.data}
            isLoading={signature.isLoading}
            isError={signature.isError}
            onRetry={signature.refetch}
            onSeeAll={() => router.push('/products')}
            onSelect={openProduct}
          />
          <HorizontalProductRail
            eyebrow="Most Loved"
            title="Best Sellers"
            products={bestSellers.data}
            isLoading={bestSellers.isLoading}
            isError={bestSellers.isError}
            onRetry={bestSellers.refetch}
            onSeeAll={() => router.push('/products')}
            onSelect={openProduct}
          />
          <View style={styles.padded}>
            <OfferBanner
              eyebrow="THE OUD EDIT"
              title="Oud, Unveiled"
              subtitle="Deep, resinous and unmistakably Arabian — explore our oud fragrances."
              onPress={() => router.push({ pathname: '/products', params: { family: 'oud' } })}
            />
          </View>
          <NewArrivalsGrid onSelect={openProduct} />
          <HorizontalProductRail
            eyebrow="Limited"
            title="Seasonal Collection"
            products={seasonal.data}
            isLoading={seasonal.isLoading}
            isError={seasonal.isError}
            onRetry={seasonal.refetch}
            onSeeAll={() => router.push('/products')}
            onSelect={openProduct}
          />
          <ReviewsRail />
          <BrandStory />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: Layout.tabBarClearance + Spacing.xl },
  sections: { gap: Layout.sectionGap, paddingTop: Layout.sectionGap },
  padded: { paddingHorizontal: Layout.screenPadding },
});
