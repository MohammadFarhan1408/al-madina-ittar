/**
 * CategoryTile — large editorial category card for the Shop grid: full-bleed image,
 * gradient scrim, Art Deco frame, name + tagline + product count.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { ArtDecoFrame } from '@/components/brand';
import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import type { Category } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryTile({
  category,
  width,
  height = 170,
  onPress,
}: {
  category: Category;
  width: number;
  height?: number;
  onPress?: (category: Category) => void;
}) {
  const { shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(category)}
      style={[styles.card, { width, height }, shadows.md, animatedStyle]}
    >
      <Image source={{ uri: category.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient colors={['rgba(11,11,11,0.05)', 'rgba(11,11,11,0.8)']} style={StyleSheet.absoluteFill} />
      <ArtDecoFrame inset={Spacing.sm} />
      <View style={styles.content}>
        <Text variant="title" colorValue={Palette.ivory} numberOfLines={1}>
          {category.name}
        </Text>
        {category.tagline ? (
          <Text variant="caption" colorValue={Palette.ivoryDim} numberOfLines={1}>
            {category.tagline}
          </Text>
        ) : null}
        <Text variant="overline" colorValue={Palette.champagne}>
          {category.productCount} PIECES
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  content: { padding: Spacing.lg, gap: 2 },
});
