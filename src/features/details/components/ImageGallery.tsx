/**
 * ImageGallery — paged product image carousel with a gradient scrim and dot indicator.
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

import { DotIndicator } from '@/components/ui';
import { Spacing } from '@/constants';

export function ImageGallery({ images, height }: { images: string[]; height: number }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ height }}>
      <Animated.ScrollView
        entering={FadeIn.duration(400)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {images.map((uri) => (
          <Image key={uri} source={{ uri }} style={{ width, height }} contentFit="cover" transition={300} />
        ))}
      </Animated.ScrollView>
      <LinearGradient
        colors={['rgba(11,11,11,0.4)', 'transparent', 'rgba(11,11,11,0.6)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {images.length > 1 ? (
        <View style={styles.dots}>
          <DotIndicator count={images.length} activeIndex={index} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', bottom: Spacing.xxl, alignSelf: 'center' },
});
