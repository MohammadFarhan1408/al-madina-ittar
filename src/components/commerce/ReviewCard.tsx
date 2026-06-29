/**
 * ReviewCard — a customer testimonial with avatar, rating, title and body.
 */
import { BadgeCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, Rating, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Review } from '@/types';

export function ReviewCard({ review, width }: { review: Review; width?: number }) {
  const { colors } = useTheme();
  return (
    <Card variant="glass" style={width ? { width } : undefined}>
      <View style={styles.header}>
        <Avatar uri={review.avatar} name={review.author} size="md" />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {review.author}
            </Text>
            {review.verified ? (
              <BadgeCheck size={IconSize.xs} color={colors.accent} strokeWidth={2} />
            ) : null}
          </View>
          <Rating value={review.rating} />
        </View>
      </View>
      <Text variant="bodyStrong" style={styles.title}>
        {review.title}
      </Text>
      <Text variant="body" color="secondary" numberOfLines={4}>
        {review.body}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerText: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  title: { marginTop: Spacing.md, marginBottom: Spacing.xs },
});
