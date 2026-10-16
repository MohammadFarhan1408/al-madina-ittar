/**
 * OfferBanner — an editorial feature panel: noir ground, a fine gold hairline inset,
 * tracked eyebrow, serif statement, quiet body and an arrow link. Optional image
 * fills the right edge on wider layouts.
 */
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { haptics } from '@/utils';

export type OfferBannerProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPress?: () => void;
};

export function OfferBanner({ eyebrow, title, subtitle, ctaLabel = 'Explore', onPress }: OfferBannerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={ctaLabel}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.inset} pointerEvents="none" />
      <View style={styles.content}>
        <Text variant="overline" colorValue={Palette.antiqueGold}>
          {eyebrow}
        </Text>
        <Text variant="heading" colorValue={Palette.ivoryText} style={styles.title}>
          {title}
        </Text>
        <Text variant="body" colorValue={Palette.taupe} style={styles.body}>
          {subtitle}
        </Text>
        <View style={styles.cta}>
          <Text variant="button" colorValue={Palette.ivoryText} uppercase>
            {ctaLabel}
          </Text>
          <ArrowRight size={14} color={Palette.ivoryText} strokeWidth={1.5} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Palette.noir,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(243,238,227,0.08)',
  },
  inset: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    bottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,162,75,0.45)',
    borderRadius: Radius.xs,
  },
  content: { paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.huge, gap: Spacing.md, alignItems: 'center' },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 300 },
  cta: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Palette.antiqueGold,
    minHeight: 32,
  },
});
