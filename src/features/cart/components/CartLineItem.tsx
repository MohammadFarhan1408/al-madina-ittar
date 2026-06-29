/**
 * CartLineItem — a cart row: thumbnail, name, price, quantity stepper and remove.
 */
import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOutRight } from 'react-native-reanimated';

import { Price, QuantityStepper, Text } from '@/components/ui';
import { HitSlop, IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useCartStore } from '@/store';
import type { CartItem } from '@/types';
import { haptics } from '@/utils';

export function CartLineItem({ item, onPress }: { item: CartItem; onPress?: () => void }) {
  const { colors } = useTheme();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { product, quantity } = item;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOutRight} style={[styles.row, { borderColor: colors.divider }]}>
      <Pressable onPress={onPress}>
        <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" transition={200} />
      </Pressable>
      <View style={styles.body}>
        <Text variant="overline" color="muted">
          {product.brand}
        </Text>
        <Text variant="bodyStrong" numberOfLines={1} onPress={onPress}>
          {product.name}
        </Text>
        <Price amount={product.price} currency={product.currency} variant="price" showDiscount={false} />
        <View style={styles.controls}>
          <QuantityStepper value={quantity} onChange={(q) => setQuantity(product.id, q)} />
          <Pressable
            hitSlop={HitSlop}
            onPress={() => {
              haptics.light();
              removeItem(product.id);
            }}
          >
            <Trash2 size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: { width: 92, height: 110, borderRadius: Radius.md },
  body: { flex: 1, gap: Spacing.xs, justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
});
