/**
 * ProductCard — the luxe product tile reused across Home, Listing, Search & Wishlist.
 * Image with badge + wishlist overlay, scent family, brand, name, rating, price and a
 * gold add-to-cart action. Width-driven so it tiles in any responsive grid.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { WishlistButton } from '@/components/product';
import { Price, ProductBadgeTag, Rating, Text } from '@/components/ui';
import { IconSize, Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useCartStore } from '@/store';
import type { Product } from '@/types';
import { haptics } from '@/utils';

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
  const { colors, shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);
  const addItem = useCartStore((s) => s.addItem);

  const imageHeight = width * (1 / Layout.productCardImageRatio);

  const handleAddToCart = () => {
    haptics.success();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(product)}
      style={[styles.container, { width }, animatedStyle]}
    >
      <View style={[styles.imageCard, { backgroundColor: colors.surfaceSunken, borderColor: colors.glassBorder }, shadows.md]}>
        <Image
          source={{ uri: product.images[0] }}
          style={[styles.image, { height: imageHeight }]}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(11,11,11,0.35)']}
          style={styles.imageScrim}
        />
        {product.badge ? (
          <View style={styles.badge}>
            <ProductBadgeTag badge={product.badge} />
          </View>
        ) : null}
        <View style={[styles.wishlist, { backgroundColor: colors.glassTint, borderColor: colors.glassBorder }]}>
          <WishlistButton productId={product.id} productName={product.name} size={IconSize.sm} />
        </View>
        {!product.inStock ? (
          <View style={[styles.soldOut, { backgroundColor: colors.overlay }]}>
            <Text variant="label" colorValue={colors.text.inverse} uppercase>
              Sold Out
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text variant="overline" color="accent" numberOfLines={1}>
          {product.scentFamily}
        </Text>
        <Text variant="bodyStrong" numberOfLines={1}>
          {product.name}
        </Text>
        <Rating value={product.rating} reviewCount={product.reviewCount} />
        <View style={styles.footer}>
          <Price amount={product.price} originalAmount={product.originalPrice} currency={product.currency} showDiscount={false} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
            disabled={!product.inStock}
            onPress={handleAddToCart}
            style={[styles.addButton, { backgroundColor: product.inStock ? colors.accent : colors.borderStrong }, product.inStock ? shadows.glow : null]}
          >
            <Plus size={IconSize.sm} color={colors.text.onAccent} strokeWidth={2.25} />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  imageCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, overflow: 'hidden' },
  image: { width: '100%' },
  imageScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 },
  badge: { position: 'absolute', top: Spacing.sm, left: Spacing.sm },
  wishlist: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOut: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: Spacing.sm, alignItems: 'center' },
  info: { gap: Spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  addButton: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
});
