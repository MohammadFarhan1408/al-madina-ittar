/**
 * HomeScreen — the storefront, paced like a printed lookbook.
 *
 * One Animated.ScrollView drives the parallax hero and a frosted header that fades in
 * as the hero leaves. Rhythm: cinematic hero → scent families → signature → curated
 * collections → best sellers → the oud edit → new arrivals → seasonal → heritage
 * chapter (full-bleed) → testimonials → the maison letter. Sections that fail or come
 * back empty hide themselves, so the page never shows a hole.
 */
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useScrollY } from '@/animations';
import { OfferBanner } from '@/components/commerce';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useBestSellers, useSeasonal, useSignature } from '@/hooks/queries';
import type { Category, Collection, Product } from '@/types';
import { BrandStory } from '../components/BrandStory';
import { CategoryRail } from '../components/CategoryRail';
import { CollectionsRail } from '../components/CollectionsRail';
import { FloatingHeader } from '../components/FloatingHeader';
import { HomeHero, useHeroHeight } from '../components/HomeHero';
import { HorizontalProductRail } from '../components/HorizontalProductRail';
import { NewArrivalsGrid } from '../components/NewArrivalsGrid';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { ReviewsRail } from '../components/ReviewsRail';

export function HomeScreen() {
  const { scrollY, handler } = useScrollY();
  const { colors } = useTheme();
  const heroHeight = useHeroHeight();
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
  const openAll = useCallback(() => router.push('/products'), []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ type: 'active' }).catch(() => undefined);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FloatingHeader scrollY={scrollY} threshold={heroHeight - 80} />
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.secondary} />
        }
      >
        <HomeHero scrollY={scrollY} />

        <View style={styles.sections}>
          <CategoryRail onSelect={openCategory} onSeeAll={() => router.push('/(tabs)/shop')} />
          <HorizontalProductRail
            eyebrow="Iconic"
            title="Signature Ittars"
            products={signature.data}
            isLoading={signature.isLoading}
            isError={signature.isError}
            onRetry={signature.refetch}
            onSeeAll={openAll}
            onSelect={openProduct}
          />
          <CollectionsRail onSelect={openCollection} />
          <HorizontalProductRail
            eyebrow="Most Loved"
            title="Best Sellers"
            products={bestSellers.data}
            isLoading={bestSellers.isLoading}
            isError={bestSellers.isError}
            onRetry={bestSellers.refetch}
            onSeeAll={openAll}
            onSelect={openProduct}
          />
          <View style={styles.padded}>
            <OfferBanner
              eyebrow="THE OUD EDIT"
              title="Oud, Unveiled"
              subtitle="Deep, resinous and unmistakably Arabian — explore our oud fragrances."
              ctaLabel="Explore oud"
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
            onSeeAll={openAll}
            onSelect={openProduct}
          />
          <BrandStory />
          <ReviewsRail />
          <NewsletterSignup />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: Layout.tabBarClearance + Spacing.xxl },
  sections: { gap: Layout.sectionGap, paddingTop: Spacing.huge },
  padded: { paddingHorizontal: Layout.screenPadding },
});
