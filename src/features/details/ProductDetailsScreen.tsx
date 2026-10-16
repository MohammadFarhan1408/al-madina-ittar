/**
 * ProductDetailsScreen — the product as an editorial page.
 *
 * Full-bleed gallery → identity (family, serif name, Arabic name, rating, price, stock)
 * → size selector (variant tiles with their own price) → the composition → fragrance
 * notes → reviews (summary, latest two, write a review) → "you may also like".
 * A frosted header with the product name fades in once the gallery scrolls away, and a
 * sticky purchase bar keeps quantity + "Add to Bag · price" within thumb reach; after a
 * successful add it turns into a confirmation with "View Bag" (and "Add More").
 *
 * States: skeleton while loading, error with retry (and a way back) if the fetch fails.
 * Business rules unchanged: sizes from `product.variants`, adding a different size
 * replaces the cart line (`addItem` → 'replaced'), reviews require sign-in.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, ChevronLeft, MessageSquareText, Star } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHeaderReveal, useScrollY } from '@/animations';
import { ProductCard, ReviewCard } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { WishlistButton } from '@/components/product';
import {
  Button,
  ErrorState,
  GlassSurface,
  Price,
  QuantityStepper,
  Skeleton,
  Text,
} from '@/components/ui';
import { ControlHeight, HitSlop, Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useProduct, useProductReviews, useProductsByCategory } from '@/hooks/queries';
import { toast, useCartStore, useSessionStore } from '@/store';
import {
  defaultVariant,
  formatPrice,
  formatRating,
  formatVolume,
  haptics,
  variantFor,
} from '@/utils';
import { ImageGallery } from './components/ImageGallery';
import { WriteReviewSheet } from './components/WriteReviewSheet';

const PAD = Layout.screenPadding;

export function ProductDetailsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scrollY, handler } = useScrollY();

  const { data: product, isLoading, isError, refetch } = useProduct(id ?? '');
  const { data: reviewsPage } = useProductReviews(id ?? '');
  const reviews = reviewsPage?.items;
  const related = useProductsByCategory(product?.categoryId ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<number | null>(null);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  /** Set after a successful add; cleared when the shopper changes size or quantity. */
  const [added, setAdded] = useState<null | { qty: number; volumeMl?: number; replaced: boolean }>(null);

  const galleryHeight = Math.round(Math.min(width * 1.2, screenHeight * 0.68));
  const headerStyle = useHeaderReveal(scrollY, galleryHeight - 60);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const openReviewSheet = () => {
    if (!isAuthenticated) {
      toast.error('Sign in to write a review');
      router.push('/(auth)/login');
      return;
    }
    setReviewSheetOpen(true);
  };

  if (isError && !product) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader title="Fragrance" />
        <ErrorState
          title="We couldn't open this fragrance"
          message="It may no longer be available, or the connection dropped. Try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (isLoading || !product) {
    return <DetailsSkeleton galleryHeight={galleryHeight} onBack={goBack} topInset={insets.top} />;
  }

  const variants = product.variants ?? [];
  const selectedSize = size ?? defaultVariant(product)?.volumeMl;
  const selectedVariant = variantFor(product, selectedSize);
  const price = selectedVariant?.price ?? product.price;
  const inStock = selectedVariant ? selectedVariant.inStock : product.inStock;
  const relatedProducts = (related.data ?? []).filter((p) => p.id !== product.id).slice(0, 6);
  const relatedCardWidth = Math.min(Math.round((width - PAD) / 2.3), 220);
  const roundedStars = Math.round(product.rating);

  const addToCart = () => {
    haptics.success();
    const result = addItem(product, qty, selectedSize);
    setAdded({ qty, volumeMl: selectedSize, replaced: result === 'replaced' });
  };

  const changeQty = (next: number) => {
    setQty(next);
    setAdded(null);
  };
  const changeSize = (next: number) => {
    setSize(next);
    setAdded(null);
  };

  const total = formatPrice(price * qty, product.currency);
  const addedSummary = added
    ? [added.volumeMl ? formatVolume(added.volumeMl) : null, `Qty ${added.qty}`].filter(Boolean).join(' · ')
    : '';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 176 + insets.bottom }}
      >
        <ImageGallery images={product.images} height={galleryHeight} name={product.name} />

        <Animated.View entering={FadeInDown.duration(480)} style={styles.content}>
          {/* Identity */}
          <View style={styles.identity}>
            <Text variant="overline" color="accent" uppercase>
              {[product.brand, product.scentFamily, product.badge].filter(Boolean).join('  ·  ')}
            </Text>
            <Text variant="heading" accessibilityRole="header">
              {product.name}
            </Text>
            {product.nameAr ? (
              <Text variant="title" color="secondary" style={styles.arabic}>
                {product.nameAr}
              </Text>
            ) : null}
          </View>

          <View style={styles.priceRow}>
            <Price
              amount={price}
              originalAmount={selectedVariant ? undefined : product.originalPrice}
              currency={product.currency}
              variant="priceLarge"
            />
            {product.reviewCount > 0 ? (
              <View
                style={styles.ratingInline}
                accessible
                accessibilityLabel={`Rated ${formatRating(product.rating)} out of 5 from ${product.reviewCount} reviews`}
              >
                <Star size={12} color={colors.accent} fill={colors.accent} strokeWidth={0} />
                <Text variant="caption" color="secondary">
                  {formatRating(product.rating)} · {product.reviewCount}{' '}
                  {product.reviewCount === 1 ? 'review' : 'reviews'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: inStock ? colors.success.base : colors.error.base }]} />
            <Text variant="caption" color="secondary">
              {inStock ? 'In stock' : 'Currently unavailable in this size'}
            </Text>
          </View>

          {/* Sizes */}
          {variants.length > 0 ? (
            <View style={[styles.block, { borderTopColor: colors.divider }]}>
              <View style={styles.blockHead}>
                <Text variant="overline" color="muted">
                  SIZE
                </Text>
                {selectedSize ? (
                  <Text variant="caption" color="secondary">
                    {formatVolume(selectedSize)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.sizes} accessibilityRole="radiogroup" accessibilityLabel="Size">
                {variants.map((v) => {
                  const selected = selectedSize === v.volumeMl;
                  return (
                    <Pressable
                      key={v.volumeMl}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected, disabled: !v.inStock }}
                      accessibilityLabel={`${formatVolume(v.volumeMl)}, ${formatPrice(v.price, product.currency)}${v.inStock ? '' : ', sold out'}`}
                      disabled={!v.inStock}
                      onPress={() => {
                        haptics.selection();
                        changeSize(v.volumeMl);
                      }}
                      style={({ pressed }) => [
                        styles.sizeTile,
                        {
                          borderColor: selected ? colors.text.primary : colors.border,
                          backgroundColor: selected ? colors.surfaceElevated : 'transparent',
                          opacity: !v.inStock ? 0.45 : pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text variant="bodyStrong" style={!v.inStock && styles.struck}>
                        {formatVolume(v.volumeMl)}
                      </Text>
                      <Text variant="caption" color={selected ? 'primary' : 'muted'}>
                        {v.inStock ? formatPrice(v.price, product.currency) : 'Sold out'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Composition */}
          <View style={[styles.block, { borderTopColor: colors.divider }]}>
            <Text variant="overline" color="muted">
              THE COMPOSITION
            </Text>
            <Text variant="body" color="secondary" style={styles.description}>
              {product.description}
            </Text>
          </View>

          {/* Notes */}
          {product.notes.length > 0 ? (
            <View style={[styles.block, { borderTopColor: colors.divider }]}>
              <Text variant="overline" color="muted">
                FRAGRANCE NOTES
              </Text>
              <View style={styles.notes}>
                {product.notes.map((note) => (
                  <View key={note} style={[styles.note, { borderColor: colors.border }]}>
                    <Text variant="caption" color="primary">
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Reviews */}
          <View style={[styles.block, { borderTopColor: colors.divider }]}>
            <View style={styles.blockHead}>
              <Text variant="overline" color="muted">
                REVIEWS
              </Text>
            </View>
            {product.reviewCount > 0 ? (
              <View style={styles.summary}>
                <Text variant="heading" style={styles.summaryScore}>
                  {formatRating(product.rating)}
                </Text>
                <View style={styles.summaryMeta}>
                  <View style={styles.summaryStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        color={colors.accent}
                        fill={i < roundedStars ? colors.accent : 'transparent'}
                        strokeWidth={1.25}
                      />
                    ))}
                  </View>
                  <Text variant="caption" color="muted">
                    Based on {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noReviews}>
                <MessageSquareText size={18} color={colors.text.muted} strokeWidth={1.25} />
                <Text variant="body" color="secondary">
                  No reviews yet — be the first to share your impression.
                </Text>
              </View>
            )}
            {reviews?.slice(0, 2).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <Button label="Write a Review" variant="outline" onPress={openReviewSheet} />
          </View>
        </Animated.View>

        {/* Related */}
        {relatedProducts.length > 0 ? (
          <View style={[styles.related, { borderTopColor: colors.divider }]}>
            <View style={styles.padH}>
              <Text variant="overline" color="accent">
                FROM THE SAME FAMILY
              </Text>
              <Text variant="title" style={styles.relatedTitle}>
                You May Also Like
              </Text>
            </View>
            <FlatList
              horizontal
              data={relatedProducts}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.padH}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.lg }} />}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  width={relatedCardWidth}
                  onPress={(p) => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                />
              )}
            />
          </View>
        ) : null}
      </Animated.ScrollView>

      {/* Frosted header revealed on scroll */}
      <Animated.View pointerEvents="box-none" style={[styles.revealHost, headerStyle]}>
        <GlassSurface radius={0} intensity={80} bordered={false}>
          <View
            style={[
              styles.revealBar,
              { paddingTop: insets.top, backgroundColor: colors.tabBar, borderBottomColor: colors.divider },
            ]}
          >
            <View style={styles.revealSide} />
            <Text variant="bodyStrong" numberOfLines={1} style={styles.revealTitle}>
              {product.name}
            </Text>
            <View style={styles.revealSide} />
          </View>
        </GlassSurface>
      </Animated.View>

      {/* Floating controls (always on top) */}
      <View style={[styles.topBar, { top: insets.top + Spacing.xs }]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={HitSlop}
          onPress={goBack}
          style={({ pressed }) => [styles.circle, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ChevronLeft size={20} color={Palette.ink} strokeWidth={1.75} />
        </Pressable>
        <WishlistButton productId={product.id} productName={product.name} size={18} onImage />
      </View>

      {/* Sticky purchase bar */}
      <GlassSurface radius={0} intensity={80} bordered={false} style={styles.bar}>
        <View
          style={[
            styles.barInner,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              backgroundColor: colors.tabBar,
              borderTopColor: colors.divider,
            },
          ]}
        >
          {added ? (
            <Animated.View key="added" entering={FadeIn.duration(220)} style={styles.barStack}>
              <View style={styles.addedRow} accessibilityLiveRegion="polite">
                <View style={[styles.addedTick, { backgroundColor: colors.success.soft }]}>
                  <Check size={12} color={colors.success.base} strokeWidth={2.25} />
                </View>
                <Text variant="caption" color="primary" numberOfLines={1} style={styles.flex}>
                  {added.replaced ? 'Size updated in your bag' : 'Added to your bag'}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {addedSummary}
                </Text>
              </View>
              <View style={styles.barRow}>
                <Button
                  label="Add More"
                  variant="outline"
                  onPress={() => setAdded(null)}
                  style={styles.secondaryBtn}
                />
                <Button
                  label="View Bag"
                  rightIcon={<ArrowRight size={14} color={colors.onCta} strokeWidth={1.75} />}
                  onPress={() => router.push('/(tabs)/cart')}
                  style={styles.addBtn}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View key="add" entering={FadeIn.duration(220)} style={styles.barRow}>
              <QuantityStepper value={qty} onChange={changeQty} height={ControlHeight.md} />
              <Button
                label={inStock ? `Add to Bag · ${total}` : 'Sold Out'}
                accessibilityLabel={inStock ? `Add ${qty} to bag, total ${total}` : 'Sold out'}
                disabled={!inStock}
                onPress={addToCart}
                style={styles.addBtn}
              />
            </Animated.View>
          )}
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

function DetailsSkeleton({
  galleryHeight,
  onBack,
  topInset,
}: {
  galleryHeight: number;
  onBack: () => void;
  topInset: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      accessible
      accessibilityLabel="Loading fragrance"
    >
      <Skeleton width="100%" height={galleryHeight} radius={0} />
      <View style={[styles.content, { gap: Spacing.md }]}>
        <Skeleton width="40%" height={9} />
        <Skeleton width="75%" height={28} />
        <Skeleton width="30%" height={20} />
        <View style={{ height: Spacing.lg }} />
        <View style={styles.sizes}>
          <Skeleton width={96} height={60} radius={Radius.xs} />
          <Skeleton width={96} height={60} radius={Radius.xs} />
          <Skeleton width={96} height={60} radius={Radius.xs} />
        </View>
        <View style={{ height: Spacing.lg }} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="92%" height={12} />
        <Skeleton width="60%" height={12} />
      </View>
      <View style={[styles.topBar, { top: topInset + Spacing.xs }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.circle}>
          <ChevronLeft size={20} color={Palette.ink} strokeWidth={1.75} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padH: { paddingHorizontal: PAD },
  content: { paddingHorizontal: PAD, paddingTop: Spacing.xxl },
  identity: { gap: Spacing.sm },
  arabic: { writingDirection: 'rtl' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  ratingInline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  block: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xxl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sizeTile: {
    minWidth: 96,
    minHeight: 60,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    gap: 2,
  },
  struck: { textDecorationLine: 'line-through' },
  description: { lineHeight: 25 },
  notes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  note: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  summaryScore: { fontSize: 40, lineHeight: 46 },
  summaryMeta: { gap: Spacing.xs },
  summaryStars: { flexDirection: 'row', gap: 3 },
  noReviews: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  related: {
    marginTop: Spacing.huge,
    paddingTop: Spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xl,
  },
  relatedTitle: { marginTop: Spacing.xs, fontSize: 22, lineHeight: 28 },
  revealHost: { position: 'absolute', top: 0, left: 0, right: 0 },
  revealBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingBottom: Spacing.xs,
    paddingHorizontal: PAD,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  revealSide: { width: 52 },
  revealTitle: { flex: 1, textAlign: 'center' },
  topBar: {
    position: 'absolute',
    left: PAD - Spacing.xs,
    right: PAD - Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 243, 234, 0.92)',
  },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    paddingHorizontal: PAD,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  barStack: { gap: Spacing.md },
  addedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 20 },
  addedTick: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  secondaryBtn: { flex: 0.8, alignSelf: 'center', paddingHorizontal: Spacing.md },
  addBtn: { flex: 1, alignSelf: 'center', paddingHorizontal: Spacing.lg },
});
