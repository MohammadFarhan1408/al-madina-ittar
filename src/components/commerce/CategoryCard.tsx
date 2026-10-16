/**
 * CategoryCard — a scent-family medallion: circular photograph inside a hairline ring,
 * tracked caps label beneath. Used in the Home rail. (Shop uses CategoryTile.)
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
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.95);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${category.productCount} fragrances`}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(category)}
      style={[styles.container, animatedStyle]}
    >
      <View style={[styles.ring, { borderColor: colors.border }]}>
        <View style={[styles.imageWrap, { backgroundColor: colors.imageWell }]}>
          <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" transition={250} />
        </View>
      </View>
      <Text variant="overline" color="secondary" uppercase numberOfLines={1} align="center">
        {category.name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: SIZE, gap: Spacing.md },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    padding: 4,
  },
  imageWrap: { flex: 1, borderRadius: SIZE / 2, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
