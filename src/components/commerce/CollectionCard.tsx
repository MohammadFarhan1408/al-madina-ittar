/**
 * CollectionCard — portrait editorial card for curated collections: full-bleed image,
 * a bottom-weighted scrim, a short accent rule in the collection's jewel tone, count
 * eyebrow, serif title and subtitle. No frames, no gimmicks — the photograph leads.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/animations';
import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import type { Collection } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ACCENT: Record<Collection['accent'], string> = {
  gold: Palette.antiqueGold,
  emerald: Palette.emeraldLift,
  burgundy: Palette.burgundyLift,
};

export function CollectionCard({
  collection,
  width,
  height = 360,
  onPress,
}: {
  collection: Collection;
  width: number;
  height?: number;
  onPress?: (collection: Collection) => void;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const accent = ACCENT[collection.accent];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${collection.title} collection, ${collection.productCount} pieces. ${collection.subtitle}`}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress?.(collection)}
      style={[styles.card, { width, height, backgroundColor: Palette.obsidian }, animatedStyle]}
    >
      <Image source={{ uri: collection.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={350} />
      <LinearGradient
        colors={['rgba(11,11,11,0)', 'rgba(11,11,11,0.25)', 'rgba(11,11,11,0.9)']}
        locations={[0.35, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={[styles.rule, { backgroundColor: accent }]} />
        <Text variant="overline" colorValue={Palette.champagne}>
          {collection.productCount} PIECES
        </Text>
        <Text variant="title" colorValue={Palette.ivoryText} numberOfLines={2} style={styles.title}>
          {collection.title}
        </Text>
        <Text variant="caption" colorValue="rgba(243,238,227,0.78)" numberOfLines={2}>
          {collection.subtitle}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  content: { padding: Spacing.xl, gap: Spacing.xs },
  rule: { width: 24, height: 1.5, marginBottom: Spacing.sm },
  title: { fontSize: 24, lineHeight: 30 },
});
