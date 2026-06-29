/**
 * WishlistButton — heart toggle bound to the wishlist store. Pops & fills on activation.
 */
import { Heart } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { spring } from '@/animations';
import { HitSlop, IconSize } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useIsWishlisted, useWishlistStore } from '@/store';
import { haptics } from '@/utils';

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export function WishlistButton({
  productId,
  productName,
  size = IconSize.md,
}: {
  productId: string;
  productName?: string;
  size?: number;
}) {
  const { colors } = useTheme();
  const isWishlisted = useIsWishlisted(productId);
  const toggle = useWishlistStore((s) => s.toggle);
  const scale = useSharedValue(1);

  const onPress = () => {
    const willAdd = !isWishlisted;
    scale.value = withSequence(withSpring(1.25, spring.bouncy), withSpring(1, spring.soft));
    haptics.medium();
    toggle(productId);
    toast.success(
      willAdd ? `${productName ?? 'Item'} saved to your wishlist` : 'Removed from wishlist',
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable hitSlop={HitSlop} onPress={onPress} accessibilityRole="button">
      <Animated.View style={animatedStyle}>
        <AnimatedHeart
          size={size}
          color={isWishlisted ? colors.error.base : colors.text.secondary}
          fill={isWishlisted ? colors.error.base : 'transparent'}
          strokeWidth={1.75}
        />
      </Animated.View>
    </Pressable>
  );
}
