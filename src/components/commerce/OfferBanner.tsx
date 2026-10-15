/**
 * OfferBanner — full-width promotional banner with gradient, pattern and CTA.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ArtDecoPattern } from '@/components/brand';
import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';

export type OfferBannerProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPress?: () => void;
};

export function OfferBanner({ eyebrow, title, subtitle, ctaLabel = 'Shop now', onPress }: OfferBannerProps) {
  const { colors, shadows } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={({ pressed }) => [styles.wrap, shadows.md, { opacity: pressed ? 0.92 : 1 }]}
    >
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <ArtDecoPattern color={Palette.champagne} opacity={0.08} />
        <View style={styles.content}>
          <Text variant="overline" colorValue={Palette.champagne}>
            {eyebrow}
          </Text>
          <Text variant="heading" colorValue={Palette.ivory}>
            {title}
          </Text>
          <Text variant="body" colorValue={Palette.ivoryDim}>
            {subtitle}
          </Text>
          <View style={[styles.cta, { borderColor: Palette.champagne }]}>
            <Text variant="label" colorValue={Palette.champagne} uppercase>
              {ctaLabel}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.xl, overflow: 'hidden' },
  gradient: { padding: Spacing.xxl },
  content: { gap: Spacing.sm, alignItems: 'flex-start' },
  cta: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
});
