/**
 * ProductCard — the editorial product tile reused across Home, Listing, Search,
 * Wishlist and Details. A 4:5 image well (badge plate, quiet wishlist heart, add-to-bag
 * disc), then scent family, name and price set in type — no boxes, no glow.
 * Width-driven so it tiles in any responsive grid.
 */
import { Image } from 'expo-image';
import { ShoppingBag } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { WishlistButton } from '@/components/product';
import { Price, ProductBadgeTag, Text } from '@/components/ui';
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

  const imageHeight = width / Layout.productCardImageRatio;
  const compact = width < 150;

  const handleAddToCart = () => {
    haptics.success();
    const inCart = useCartStore.getState().items.find((i) => i.product.id === product.id);
    const result = addItem(product, 1, inCart ? inCart.volumeMl : defaultVariant(product)?.volumeMl);
    toast.success(
      result === 'replaced' ? `${product.name} size updated in your bag` : `${product.name} added to your bag`,
    );
  };

  const a11yLabel = [
    product.name,
    product.scentFamily,
    formatPrice(product.price, product.currency),
    product.reviewCount > 0 ? `rated ${formatRating(product.rating)}` : null,
    product.inStock ? null : 'sold out',
  ]
    .filter(Boolean)
    .join(', ');

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
      <View style={[styles.imageWell, { height: imageHeight, backgroundColor: colors.imageWell }]}>
        <Image
          source={{ uri: product.images[0] }}
          style={[StyleSheet.absoluteFill, !product.inStock && styles.dimmed]}
          contentFit="cover"
          transition={350}
          recyclingKey={product.id}
          accessibilityIgnoresInvertColors
        />
        {product.badge && product.inStock ? (
          <View style={styles.badge}>
            <ProductBadgeTag badge={product.badge} />
          </View>
        ) : null}
        {!product.inStock ? (
          <View style={styles.badge}>
            <View style={styles.soldOut}>
              <Text variant="overline" colorValue={Palette.ivoryText} style={styles.soldOutText}>
                SOLD OUT
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.wishlist}>
          <WishlistButton productId={product.id} productName={product.name} size={15} onImage />
        </View>
        {product.inStock ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to bag`}
            hitSlop={HitSlop}
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: 'rgba(247, 243, 234, 0.92)', opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ShoppingBag size={15} color={Palette.ink} strokeWidth={1.6} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text variant="overline" color="muted" numberOfLines={1} uppercase>
          {product.scentFamily}
          {product.reviewCount > 0 && !compact ? `  ·  ★ ${formatRating(product.rating)}` : ''}
        </Text>
        <Text variant="bodyStrong" numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Price
          amount={product.price}
          originalAmount={product.originalPrice}
          currency={product.currency}
          showDiscount={false}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  imageWell: { borderRadius: Radius.sm, overflow: 'hidden' },
  dimmed: { opacity: 0.55 },
  badge: { position: 'absolute', top: Spacing.sm, left: Spacing.sm },
  soldOut: {
    backgroundColor: 'rgba(11,11,11,0.72)',
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  soldOutText: { letterSpacing: 1.6 },
  wishlist: { position: 'absolute', top: Spacing.xs, right: Spacing.xs },
  addButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { gap: 3 },
  name: { lineHeight: 20 },
});
