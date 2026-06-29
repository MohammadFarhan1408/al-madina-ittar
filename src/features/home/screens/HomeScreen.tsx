/**
 * HomeScreen — the luxury storefront. A single Animated.ScrollView drives the parallax
 * hero and a floating glass header that fades in on scroll. Sections: Hero → Categories →
 * Featured Collections → Signature → Best Sellers → Exclusive Offer → New Arrivals →
 * Seasonal → Reviews → Brand Story.
 */
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useScrollY } from '@/animations';
import { OfferBanner } from '@/components/commerce';
import { Layout, Spacing } from '@/constants';
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
  const openCollection = useCallback((_c: Collection) => router.push('/products'), []);

  return (
    <View style={styles.root}>
      <FloatingHeader scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
            onSeeAll={() => router.push('/products')}
            onSelect={openProduct}
          />
          <HorizontalProductRail
            eyebrow="Most Loved"
            title="Best Sellers"
            products={bestSellers.data}
            isLoading={bestSellers.isLoading}
            onSeeAll={() => router.push('/products')}
            onSelect={openProduct}
          />
          <View style={styles.padded}>
            <OfferBanner
              eyebrow="EXCLUSIVE OFFER"
              title="20% Off Oud"
              subtitle="A private sale on our most precious oud, for two days only."
              onPress={() => router.push('/products')}
            />
          </View>
          <NewArrivalsGrid onSelect={openProduct} />
          <HorizontalProductRail
            eyebrow="Limited"
            title="Seasonal Collection"
            products={seasonal.data}
            isLoading={seasonal.isLoading}
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
