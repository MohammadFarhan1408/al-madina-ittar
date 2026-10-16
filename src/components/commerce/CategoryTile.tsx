/**
 * CategoryTile — portrait editorial category card for the Shop grid: full-bleed image
 * in a neutral well, bottom scrim, serif name, tagline and a tracked piece count.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import type { Category } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryTile({
  category,
  width,
  height,
  onPress,
}: {
  category: Category;
  width: number;
  height?: number;
  onPress?: (category: Category) => void;
}) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const h = height ?? Math.round(width * 1.25);
  const count = `${category.productCount} ${category.productCount === 1 ? 'PIECE' : 'PIECES'}`;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${category.productCount} fragrances${category.tagline ? `. ${category.tagline}` : ''}`}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(category)}
      style={[styles.card, { width, height: h, backgroundColor: colors.imageWell }, animatedStyle]}
    >
      <Image
        source={{ uri: category.image }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={350}
        recyclingKey={category.id}
      />
      <LinearGradient
        colors={['rgba(11,11,11,0)', 'rgba(11,11,11,0.2)', 'rgba(11,11,11,0.86)']}
        locations={[0.35, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text variant="overline" colorValue={Palette.champagne}>
          {count}
        </Text>
        <Text variant="title" colorValue={Palette.ivoryText} numberOfLines={2} style={styles.name}>
          {category.name}
        </Text>
        {category.tagline ? (
          <Text variant="caption" colorValue="rgba(243,238,227,0.75)" numberOfLines={1}>
            {category.tagline}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  content: { padding: Spacing.lg, gap: 2 },
  name: { fontSize: 19, lineHeight: 24 },
});
