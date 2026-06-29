/**
 * OrderSuccess — celebratory confirmation shown after a mock order is placed.
 */
import { CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtDecoDivider, FloatingMotif, GradientBackdrop } from '@/components/brand';
import { Button, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';

export function OrderSuccess({ reference }: { reference: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <GradientBackdrop variant="hero" pattern patternOpacity={0.08} />
      <FloatingMotif size={90} color={Palette.champagne} opacity={0.3} style={[styles.motif, { top: insets.top + 40 }]} />
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <CheckCircle2 size={IconSize.xxl + 24} color={Palette.gold} strokeWidth={1.5} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.copy}>
          <Text variant="display" colorValue={Palette.ivory} align="center">
            Order Confirmed
          </Text>
          <ArtDecoDivider color={Palette.champagne} width={140} />
          <Text variant="body" colorValue={Palette.ivoryDim} align="center" style={styles.body}>
            Thank you for your purchase. Your fragrances are being prepared with the utmost care.
          </Text>
          <Text variant="overline" colorValue={Palette.champagne} align="center">
            REFERENCE {reference}
          </Text>
        </Animated.View>
      </View>
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button label="View My Orders" variant="gradient" glow onPress={() => router.replace('/orders')} />
        <Button label="Continue Shopping" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  motif: { position: 'absolute', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Layout.screenPadding, gap: Spacing.xl },
  copy: { alignItems: 'center', gap: Spacing.md },
  body: { maxWidth: 320 },
  actions: { paddingHorizontal: Layout.screenPadding, gap: Spacing.sm },
});
