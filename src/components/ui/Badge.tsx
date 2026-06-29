/**
 * Badge — small status/label pill. Maps product badges & status tones to brand colors.
 */
import { View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { ProductBadge } from '@/types';
import { Text } from './Text';

export type BadgeTone = 'gold' | 'emerald' | 'burgundy' | 'neutral' | 'error';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'gold', style }: BadgeProps) {
  const { colors } = useTheme();

  const toneMap: Record<BadgeTone, { bg: string; fg: string }> = {
    gold: { bg: colors.accent, fg: colors.text.onAccent },
    emerald: { bg: colors.emerald, fg: colors.text.inverse },
    burgundy: { bg: colors.burgundy, fg: colors.text.inverse },
    neutral: { bg: colors.surfaceSunken, fg: colors.text.secondary },
    error: { bg: colors.error.base, fg: colors.text.inverse },
  };
  const c = toneMap[tone];

  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: Radius.xs,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xxs,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="label" colorValue={c.fg} uppercase>
        {label}
      </Text>
    </View>
  );
}

const PRODUCT_BADGE_TONE: Record<ProductBadge, BadgeTone> = {
  new: 'emerald',
  bestseller: 'gold',
  limited: 'burgundy',
  exclusive: 'gold',
};

/** Convenience badge driven by a Product's `badge` field. */
export function ProductBadgeTag({ badge }: { badge: ProductBadge }) {
  return <Badge label={badge} tone={PRODUCT_BADGE_TONE[badge]} />;
}
