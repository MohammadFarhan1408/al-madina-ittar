/**
 * Badge — small tracked-caps tag. Product badges sit on imagery, so they use a quiet
 * ivory plate with ink text (legible on any photo) rather than saturated fills.
 */
import { View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';
import type { ProductBadge } from '@/types';
import { Text } from './Text';

export type BadgeTone = 'gold' | 'emerald' | 'burgundy' | 'neutral' | 'error' | 'plate';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'gold', style }: BadgeProps) {
  const { colors } = useTheme();

  const toneMap: Record<BadgeTone, { bg: string; fg: string; border?: string }> = {
    gold: { bg: colors.accentSoft, fg: colors.accent },
    emerald: { bg: colors.success.soft, fg: colors.success.base },
    burgundy: { bg: colors.error.soft, fg: colors.error.base },
    neutral: { bg: colors.surfaceSunken, fg: colors.text.secondary },
    error: { bg: colors.error.soft, fg: colors.error.base },
    plate: { bg: 'rgba(247, 243, 234, 0.92)', fg: Palette.ink },
  };
  const c = toneMap[tone];

  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: Radius.xs,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="overline" colorValue={c.fg} uppercase style={{ letterSpacing: 1.6 }}>
        {label}
      </Text>
    </View>
  );
}

/** Convenience badge driven by a Product's `badge` field (rendered over imagery). */
export function ProductBadgeTag({ badge }: { badge: ProductBadge }) {
  return <Badge label={badge} tone="plate" />;
}
