/**
 * Branded animated splash — quiet and quick, like the first frame of a film:
 * noir ground, the wordmark in the house face rising into place, a fine gold rule
 * drawing outward beneath it, then the maison line. Signals completion via `onDone`
 * (same contract as before; total ≈ 1.7s). Honours the global reduced-motion setting.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants';
import { Palette } from '@/constants/colors';

const EASE = Easing.bezier(0.2, 0, 0, 1);

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const mark = useSharedValue(0);
  const rule = useSharedValue(0);
  const tagline = useSharedValue(0);
  const hold = useSharedValue(0);

  useEffect(() => {
    mark.value = withTiming(1, { duration: 900, easing: EASE });
    rule.value = withDelay(450, withTiming(1, { duration: 800, easing: EASE }));
    tagline.value = withDelay(800, withTiming(1, { duration: 700, easing: EASE }));
    hold.value = withDelay(
      1700,
      withTiming(1, { duration: 1 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, mark, rule, tagline, hold]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ translateY: (1 - mark.value) * 14 }],
  }));
  const ruleStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: rule.value }], opacity: rule.value }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 6 }],
  }));

  return (
    <View style={styles.root} accessible accessibilityLabel="Al Madina Ittar">
      <Animated.View style={markStyle}>
        <Text variant="display" colorValue={Palette.ivoryText} align="center" style={styles.title}>
          AL MADINA
        </Text>
      </Animated.View>
      <Animated.View style={[styles.rule, ruleStyle]} />
      <Animated.View style={taglineStyle}>
        <Text variant="overline" colorValue={Palette.champagne} align="center" style={styles.tagline}>
          ITTAR · MAISON DE PARFUM
        </Text>
      </Animated.View>
      <Animated.View style={[styles.footer, taglineStyle]}>
        <Text variant="overline" colorValue={Palette.ash} align="center">
          THE ART OF ARABIAN PERFUMERY
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.richBlack,
    gap: Spacing.lg,
  },
  title: { letterSpacing: 8, fontSize: 34, lineHeight: 40 },
  rule: { width: 56, height: 1, backgroundColor: Palette.antiqueGold },
  tagline: { letterSpacing: 3.2 },
  footer: { position: 'absolute', bottom: Spacing.giant },
});
