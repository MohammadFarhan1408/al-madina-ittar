/**
 * CollectionCard — wide editorial card for curated/seasonal collections. Image with a
 * gradient scrim, accent-tinted, with title/subtitle and an Art Deco frame.
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
import type { Collection } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ACCENT: Record<Collection['accent'], string> = {
  gold: Palette.gold,
  emerald: Palette.emeraldLight,
  burgundy: Palette.burgundyLight,
};

export function CollectionCard({
  collection,
  width,
  height = 200,
  onPress,
}: {
  collection: Collection;
  width: number;
  height?: number;
  onPress?: (collection: Collection) => void;
}) {
  const { shadows } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const accent = ACCENT[collection.accent];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${collection.title} collection`}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(collection)}
      style={[styles.card, { width, height }, shadows.md, animatedStyle]}
    >
      <Image source={{ uri: collection.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient
        colors={['rgba(11,11,11,0.1)', 'rgba(11,11,11,0.85)']}
        style={StyleSheet.absoluteFill}
      />
      <ArtDecoFrame color={accent} inset={Spacing.sm} />
      <View style={styles.content}>
        <Text variant="overline" colorValue={accent}>
          {collection.productCount} PIECES
        </Text>
        <Text variant="title" colorValue={Palette.ivory} numberOfLines={1}>
          {collection.title}
        </Text>
        <Text variant="caption" colorValue={Palette.ivoryDim} numberOfLines={1}>
          {collection.subtitle}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  content: { padding: Spacing.lg, gap: Spacing.xxs },
});
