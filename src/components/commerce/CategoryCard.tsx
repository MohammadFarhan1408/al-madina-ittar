/**
 * CategoryCard — circular image medallion with a gold ring and name label. Used in the
 * Home category rail. (The Shop screen uses CategoryTile for larger editorial cards.)
 */
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Category } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SIZE = Layout.categoryCardSize;

export function CategoryCard({
  category,
  onPress,
}: {
  category: Category;
  onPress?: (category: Category) => void;
}) {
  const { colors, shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.94);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(category)}
      style={[styles.container, animatedStyle]}
    >
      <View style={[styles.imageWrap, { borderColor: colors.accent }, shadows.glow]}>
        <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" transition={250} />
      </View>
      <Text variant="label" color="primary" uppercase numberOfLines={1} style={styles.label}>
        {category.name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: SIZE, gap: Spacing.sm },
  imageWrap: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    padding: 4,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', borderRadius: SIZE / 2 },
  label: { letterSpacing: 1 },
});
