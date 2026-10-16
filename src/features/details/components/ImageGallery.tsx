/**
 * ImageGallery — paged, full-bleed product photography in a neutral well, with a thin
 * segmented progress line and an "01 / 03" counter. A light top scrim keeps the floating
 * controls legible on bright photos. Announces position to screen readers.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

const pad2 = (n: number) => String(n).padStart(2, '0');

export function ImageGallery({
  images,
  height,
  name,
}: {
  images: string[];
  height: number;
  name?: string;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const count = images.length;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ height, backgroundColor: colors.imageWell }}>
      <Animated.ScrollView
        entering={FadeIn.duration(500)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        accessibilityLabel={`${name ?? 'Product'} photos, ${index + 1} of ${count}`}
      >
        {images.map((uri, i) => (
          <Image
            key={`${uri}-${i}`}
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={350}
            accessibilityIgnoresInvertColors
          />
        ))}
      </Animated.ScrollView>
      <LinearGradient
        colors={['rgba(11,11,11,0.38)', 'rgba(11,11,11,0)']}
        locations={[0, 0.3]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {count > 1 ? (
        <View style={styles.footer} pointerEvents="none">
          <View style={styles.segments}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.segment,
                  { backgroundColor: i === index ? Palette.ivoryText : 'rgba(243,238,227,0.35)' },
                ]}
              />
            ))}
          </View>
          <View style={styles.counter}>
            <Text variant="overline" colorValue={Palette.ivoryText} style={styles.counterText}>
              {pad2(index + 1)} / {pad2(count)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  segments: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 1.5, borderRadius: 1 },
  counter: {
    backgroundColor: 'rgba(11,11,11,0.45)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 2,
  },
  counterText: { letterSpacing: 1.6 },
});
