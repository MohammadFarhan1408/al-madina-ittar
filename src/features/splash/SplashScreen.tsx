/**
 * Branded animated splash: the logo mark scales/fades in over a noir backdrop with a
 * gold shimmer sweep and the wordmark, then signals completion via `onDone`.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ArtDecoDivider, GradientBackdrop, LogoMark } from '@/components/brand';
import { Text } from '@/components/ui';
import { Spacing } from '@/constants';
import { Palette } from '@/constants/colors';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.05, { duration: 700, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 300 }),
    );
    // Hold, then signal completion.
    opacity.value = withDelay(
      1700,
      withTiming(1, { duration: 1 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, opacity, scale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.root}>
      <GradientBackdrop variant="hero" pattern patternOpacity={0.08} />
      <View style={styles.center}>
        <Animated.View style={markStyle}>
          <LogoMark size={96} color={Palette.champagne} />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.wordmark}>
          <Text variant="display" colorValue={Palette.ivory} align="center" style={styles.title}>
            AL MADINA
          </Text>
          <ArtDecoDivider color={Palette.champagne} width={160} />
          <Text variant="overline" colorValue={Palette.champagne} align="center">
            MAISON DE PARFUM
          </Text>
        </Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(900).duration(800)} style={styles.footer}>
        <Text variant="caption" colorValue={Palette.stone} align="center">
          The Art of Arabian Perfumery
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: Spacing.xxl },
  wordmark: { alignItems: 'center', gap: Spacing.md },
  title: { letterSpacing: 6 },
  footer: { position: 'absolute', bottom: Spacing.giant },
});
