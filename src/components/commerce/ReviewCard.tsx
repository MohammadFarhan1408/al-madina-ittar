/**
 * ReviewCard — a customer testimonial set like a pull-quote: gold rating, serif title,
 * body, then the author line with a verified mark.
 */
import { BadgeCheck, Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Review } from '@/types';

export function ReviewCard({ review, width }: { review: Review; width?: number }) {
  const { colors } = useTheme();
  const stars = Math.round(review.rating);
  return (
    <View
      accessible
      accessibilityLabel={`${review.rating} out of 5 stars. ${review.title}. ${review.body}. By ${review.author}${review.verified ? ', verified buyer' : ''}`}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        width ? { width, minHeight: 236 } : null,
      ]}
    >
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            color={colors.accent}
            fill={i < stars ? colors.accent : 'transparent'}
            strokeWidth={1.25}
          />
        ))}
      </View>
      <Text variant="title" numberOfLines={2} style={styles.title}>
        {review.title}
      </Text>
      <Text variant="body" color="secondary" numberOfLines={4} style={styles.body}>
        {review.body}
      </Text>
      <View style={[styles.author, { borderTopColor: colors.divider }]}>
        <Avatar uri={review.avatar} name={review.author} size="sm" />
        <Text variant="caption" color="primary" numberOfLines={1} style={styles.name}>
          {review.author}
        </Text>
        {review.verified ? (
          <View style={styles.verified}>
            <BadgeCheck size={12} color={colors.accent} strokeWidth={1.75} />
            <Text variant="overline" color="muted">
              VERIFIED
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  stars: { flexDirection: 'row', gap: 3 },
  title: { fontSize: 18, lineHeight: 24 },
  body: { flexGrow: 1 },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  name: { flex: 1 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
