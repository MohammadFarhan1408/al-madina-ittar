/**
 * ProductDetailsScreen — immersive product page: image gallery hero, overlapping content
 * sheet (brand, names, rating, notes, size selector, description), reviews preview, a
 * "you may also like" rail, and a sticky glass add-to-cart bar.
 */
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtDecoDivider } from '@/components/brand';
import { ProductCard, ReviewCard } from '@/components/commerce';
import { WishlistButton } from '@/components/product';
import {
  Badge,
  Button,
  Chip,
  GlassSurface,
  Loader,
  Price,
  QuantityStepper,
  Rating,
  Text,
} from '@/components/ui';
import { HitSlop, IconSize, Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useProduct, useProductReviews, useProductsByCategory } from '@/hooks/queries';
import { toast, useCartStore, useSessionStore } from '@/store';
import { formatVolume, haptics } from '@/utils';
import { ImageGallery } from './components/ImageGallery';
import { WriteReviewSheet } from './components/WriteReviewSheet';

const SIZES = [30, 50, 75, 100];

export function ProductDetailsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProduct(id ?? '');
  const { data: reviewsPage } = useProductReviews(id ?? '');
  const reviews = reviewsPage?.items;
  const related = useProductsByCategory(product?.categoryId ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<number | null>(null);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);

  const openReviewSheet = () => {
    if (!isAuthenticated) {
      toast.error('Sign in to write a review');
      router.push('/(auth)/login');
      return;
    }
    setReviewSheetOpen(true);
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Loader fullscreen />
      </View>
    );
  }

  const selectedSize = size ?? product.volumeMl;
  const relatedProducts = (related.data ?? []).filter((p) => p.id !== product.id).slice(0, 6);

  const addToCart = () => {
    haptics.success();
    addItem(product, qty);
    toast.success(`${product.name} × ${qty} added to cart`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View>
          <ImageGallery images={product.images} height={width * 1.1} />
          {/* Floating top controls */}
          <View style={[styles.topBar, { top: insets.top + Spacing.sm }]}>
            <Pressable
              hitSlop={HitSlop}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              style={[styles.circle, { borderColor: colors.glassBorder }]}
            >
              <ChevronLeft size={IconSize.md} color={Palette.ivory} strokeWidth={1.75} />
            </Pressable>
            <View style={[styles.circle, { borderColor: colors.glassBorder, backgroundColor: colors.glassTint }]}>
              <WishlistButton productId={product.id} productName={product.name} size={IconSize.md} />
            </View>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(420)}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <Text variant="overline" color="accent">
                {product.brand} · {product.scentFamily}
              </Text>
              <Text variant="display" style={styles.name}>
                {product.name}
              </Text>
              {product.nameAr ? (
                <Text variant="title" color="secondary">
                  {product.nameAr}
                </Text>
              ) : null}
            </View>
            {product.badge ? <Badge label={product.badge} tone="gold" /> : null}
          </View>

          <View style={styles.metaRow}>
            <Rating value={product.rating} reviewCount={product.reviewCount} size={IconSize.sm} />
            <Price amount={product.price} originalAmount={product.originalPrice} currency={product.currency} variant="priceLarge" />
          </View>

          <ArtDecoDivider label="FRAGRANCE NOTES" />
          <View style={styles.notes}>
            {product.notes.map((note) => (
              <Chip key={note} label={note} />
            ))}
          </View>

          <Text variant="subtitle" style={styles.sectionTitle}>
            Size
          </Text>
          <View style={styles.sizes}>
            {SIZES.map((s) => (
              <Chip key={s} label={formatVolume(s)} selected={selectedSize === s} onPress={() => setSize(s)} />
            ))}
          </View>

          <Text variant="subtitle" style={styles.sectionTitle}>
            The Composition
          </Text>
          <Text variant="body" color="secondary">
            {product.description}
          </Text>

          <View style={styles.reviews}>
            <ArtDecoDivider label="REVIEWS" />
            {reviews?.slice(0, 2).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <Button label="Write a Review" variant="outline" size="sm" onPress={openReviewSheet} />
          </View>

          {relatedProducts.length > 0 ? (
            <View style={styles.related}>
              <Text variant="title">You May Also Like</Text>
              <FlatList
                horizontal
                data={relatedProducts}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    width={180}
                    onPress={(p) => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                  />
                )}
              />
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Sticky add-to-cart bar */}
      <GlassSurface radius={0} intensity={70} bordered={false} style={[styles.bar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={[styles.barInner, { borderTopColor: colors.divider }]}>
          <QuantityStepper value={qty} onChange={setQty} />
          <Button
            label={product.inStock ? 'Add to Cart' : 'Sold Out'}
            variant="gradient"
            glow
            disabled={!product.inStock}
            onPress={addToCart}
            style={styles.addBtn}
          />
        </View>
      </GlassSurface>

      <WriteReviewSheet
        productId={product.id}
        visible={reviewSheetOpen}
        onClose={() => setReviewSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1 },
  topBar: {
    position: 'absolute',
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,11,11,0.35)',
  },
  sheet: {
    marginTop: -Radius.xxl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  flex: { flex: 1, gap: Spacing.xs },
  name: { letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sectionTitle: { marginTop: Spacing.sm },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  reviews: { gap: Spacing.lg, marginTop: Spacing.sm },
  related: { gap: Spacing.lg, marginTop: Spacing.sm },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addBtn: { flex: 1 },
});
