/**
 * WishlistButton — heart toggle bound to the wishlist store. Pops on activation.
 *
 * `onImage` (product imagery): a small smoked-glass disc with a champagne-gold heart —
 * outlined when idle, filled gold when saved — legible on light and dark photos alike.
 * Default (on surfaces): ink outline, filled gold when saved.
 */
import { Heart } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { spring } from '@/animations';
import { HitSlop, IconSize } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import { toast, useIsWishlisted, useWishlistStore } from '@/store';
import { haptics } from '@/utils';

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export function WishlistButton({
  productId,
  productName,
  size = IconSize.md,
  onImage = false,
}: {
  productId: string;
  productName?: string;
  size?: number;
  onImage?: boolean;
}) {
  const { colors } = useTheme();
  const isWishlisted = useIsWishlisted(productId);
  const toggle = useWishlistStore((s) => s.toggle);
  const scale = useSharedValue(1);

  const onPress = () => {
    const willAdd = !isWishlisted;
    scale.value = withSequence(withSpring(1.28, spring.bouncy), withSpring(1, spring.soft));
    haptics.medium();
    toggle(productId);
    toast.success(
      willAdd ? `${productName ?? 'Item'} saved to your wishlist` : 'Removed from wishlist',
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const gold = onImage ? Palette.champagne : colors.accent;
  const stroke = isWishlisted ? gold : onImage ? Palette.ivoryText : colors.text.primary;

  return (
    <Pressable
      hitSlop={HitSlop}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isWishlisted ? `Remove ${productName ?? 'item'} from wishlist` : `Save ${productName ?? 'item'} to wishlist`}
      accessibilityState={{ selected: isWishlisted }}
      style={styles.hit}
    >
      <Animated.View style={[onImage && styles.disc, animatedStyle]}>
        <AnimatedHeart
          size={size}
          color={stroke}
          fill={isWishlisted ? gold : 'transparent'}
          strokeWidth={1.5}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 11, 11, 0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(243, 238, 227, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
