/**
 * ProductCard — the editorial product tile reused across Home, Listing, Search,
 * Wishlist and Details.
 *
 *  ┌──────────────┐  4:5 image well with a hairline edge
 *  │ NEW      (♡) │  · badge: smoked-glass tag, champagne text
 *  │              │  · wishlist: smoked-glass disc, gold heart
 *  └──────────────┘
 *  OUD          ★ 5.0     family (tracked caps) · rating
 *  Oud Black               serif name, up to 2 lines
 *  AED 410          [👜]  price · hairline bag button (gold icon; fills gold when in bag)
 *
 * Width-driven so it tiles in any responsive grid. Add-to-bag keeps the existing rule
 * (current size if already in the bag, else the default variant) and offers "View bag".
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Check, ShoppingBag, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { spring, usePressScale } from '@/animations';
import { WishlistButton } from '@/components/product';
import { Price, Text } from '@/components/ui';
import { HitSlop, Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import { toast, useCartStore } from '@/store';
import type { Product } from '@/types';
import { defaultVariant, formatPrice, formatRating, haptics } from '@/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({
  product,
  width,
  onPress,
}: {
  product: Product;
  width: number;
  onPress?: (product: Product) => void;
}) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const addItem = useCartStore((s) => s.addItem);
  const inBag = useCartStore((s) => s.items.some((i) => i.product.id === product.id));
  const bagScale = useSharedValue(1);
  const bagStyle = useAnimatedStyle(() => ({ transform: [{ scale: bagScale.value }] }));

  const imageHeight = width / Layout.productCardImageRatio;
  const compact = width < 150;
  const showRating = product.reviewCount > 0 && !compact;

  const handleAddToCart = () => {
    haptics.success();
    bagScale.value = withSequence(withSpring(0.85, spring.responsive), withSpring(1, spring.bouncy));
    const inCart = useCartStore.getState().items.find((i) => i.product.id === product.id);
    const result = addItem(product, 1, inCart ? inCart.volumeMl : defaultVariant(product)?.volumeMl);
    toast.show({
      variant: 'success',
      message:
        result === 'replaced' ? `${product.name} size updated in your bag` : `${product.name} added to your bag`,
      action: { label: 'View bag', onPress: () => router.push('/(tabs)/cart') },
    });
  };

  const a11yLabel = [
    product.name,
    product.scentFamily,
    formatPrice(product.price, product.currency),
    product.reviewCount > 0 ? `rated ${formatRating(product.rating)}` : null,
    product.inStock ? null : 'sold out',
    inBag ? 'in your bag' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const tag = !product.inStock ? 'SOLD OUT' : product.badge ? product.badge.toUpperCase() : null;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens product details"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(product)}
      style={[styles.container, { width }, animatedStyle]}
    >
      {/* Image */}
      <View
        style={[
          styles.imageWell,
          { height: imageHeight, backgroundColor: colors.imageWell, borderColor: colors.border },
        ]}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={[StyleSheet.absoluteFill, !product.inStock && styles.dimmed]}
          contentFit="cover"
          transition={350}
          recyclingKey={product.id}
          accessibilityIgnoresInvertColors
        />
        {tag ? (
          <View style={styles.tag}>
            <Text variant="overline" colorValue={Palette.champagne} style={styles.tagText}>
              {tag}
            </Text>
          </View>
        ) : null}
        <View style={styles.wishlist}>
          <WishlistButton productId={product.id} productName={product.name} size={15} onImage />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.metaRow}>
          <Text variant="overline" color="muted" numberOfLines={1} uppercase style={styles.flex}>
            {product.scentFamily}
          </Text>
          {showRating ? (
            <View style={styles.rating}>
              <Star size={10} color={colors.accent} fill={colors.accent} strokeWidth={0} />
              <Text variant="caption" color="secondary" style={styles.ratingText}>
                {formatRating(product.rating)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="title" numberOfLines={2} style={[styles.name, compact && styles.nameCompact]}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.flex}>
            <Price
              amount={product.price}
              originalAmount={product.originalPrice}
              currency={product.currency}
              showDiscount={false}
            />
          </View>
          {product.inStock ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={inBag ? `Add another ${product.name} to bag` : `Add ${product.name} to bag`}
              hitSlop={HitSlop}
              onPress={handleAddToCart}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Animated.View
                style={[
                  styles.bag,
                  inBag
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { borderColor: colors.borderStrong },
                  bagStyle,
                ]}
              >
                {inBag ? (
                  <Check size={14} color={colors.text.onAccent} strokeWidth={2} />
                ) : (
                  <ShoppingBag size={15} color={colors.accent} strokeWidth={1.5} />
                )}
              </Animated.View>
            </Pressable>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  flex: { flex: 1 },
  imageWell: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  dimmed: { opacity: 0.5 },
  tag: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(11, 11, 11, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 215, 168, 0.35)',
    borderRadius: Radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagText: { fontSize: 9, lineHeight: 12, letterSpacing: 1.8 },
  wishlist: { position: 'absolute', top: 2, right: 2 },
  info: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, lineHeight: 14 },
  name: { fontSize: 17, lineHeight: 22 },
  nameCompact: { fontSize: 15, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  bag: {
    width: 34,
    height: 34,
    borderRadius: Radius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
