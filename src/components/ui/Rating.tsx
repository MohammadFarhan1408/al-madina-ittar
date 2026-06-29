/**
 * Rating — gold star with numeric value and optional review count.
 */
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';

import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { formatRating, formatReviewCount } from '@/utils';
import { Text } from './Text';

export type RatingProps = {
  value: number;
  reviewCount?: number;
  size?: number;
};

export function Rating({ value, reviewCount, size = IconSize.xs }: RatingProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Star size={size} color={colors.accent} fill={colors.accent} strokeWidth={0} />
      <Text variant="caption" color="secondary">
        {formatRating(value)}
        {typeof reviewCount === 'number' ? ` (${formatReviewCount(reviewCount)})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
