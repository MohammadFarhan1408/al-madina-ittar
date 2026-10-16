/**
 * CartLineItem — one bag line: portrait thumbnail, name, size/family meta, line total
 * (with unit price when qty > 1), a compact quantity stepper and a "Remove" link.
 * Removing offers an Undo (re-adds the same product, size and quantity via the store,
 * so cart sync stays on its single path).
 */
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

import { QuantityStepper, Text } from '@/components/ui';
import { HitSlop, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useCartStore } from '@/store';
import type { CartItem } from '@/types';
import { formatPrice, formatVolume, haptics, unitPrice } from '@/utils';

export function CartLineItem({ item, onPress }: { item: CartItem; onPress?: () => void }) {
  const { colors } = useTheme();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { product, quantity, volumeMl } = item;
  const unit = unitPrice(product, volumeMl);

  const remove = () => {
    haptics.light();
    removeItem(product.id);
    toast.show({
      variant: 'info',
      message: `${product.name} removed from your bag`,
      action: {
        label: 'Undo',
        onPress: () => useCartStore.getState().addItem(product, quantity, volumeMl),
      },
    });
  };

  const meta = [volumeMl ? formatVolume(volumeMl) : null, product.scentFamily].filter(Boolean).join(' · ');

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOutLeft.duration(220)}
      layout={LinearTransition.duration(240)}
      style={[styles.row, { borderBottomColor: colors.divider }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
        onPress={onPress}
        style={[styles.thumb, { backgroundColor: colors.imageWell }]}
      >
        <Image source={{ uri: product.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.flex}>
            <Text variant="bodyStrong" numberOfLines={2} onPress={onPress}>
              {product.name}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1} style={styles.meta}>
              {meta}
            </Text>
          </View>
          <View style={styles.priceCol}>
            <Text variant="price">{formatPrice(unit * quantity, product.currency)}</Text>
            {quantity > 1 ? (
              <Text variant="caption" color="muted">
                {formatPrice(unit, product.currency)} each
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.controls}>
          <QuantityStepper compact value={quantity} onChange={(q) => setQuantity(product.id, q)} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${product.name} from bag`}
            hitSlop={HitSlop}
            onPress={remove}
            style={({ pressed }) => [styles.remove, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Text variant="label" color="secondary" uppercase style={[styles.removeText, { textDecorationColor: colors.borderStrong }]}>
              Remove
            </Text>
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
    paddingVertical: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 88, height: 110, borderRadius: Radius.sm, overflow: 'hidden' },
  body: { flex: 1, justifyContent: 'space-between', gap: Spacing.md },
  top: { flexDirection: 'row', gap: Spacing.md },
  flex: { flex: 1 },
  meta: { marginTop: 2, textTransform: 'capitalize' },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remove: { minHeight: 36, justifyContent: 'center' },
  removeText: { textDecorationLine: 'underline' },
});
