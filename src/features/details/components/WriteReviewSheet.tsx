/**
 * WriteReviewSheet — a small BottomSheet form (star picker + title + body) for
 * `POST /products/:id/reviews`. `author`/`verified` are never sent — the backend
 * derives both.
 */
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { BottomSheet, Button, FormField, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useCreateReview } from '@/hooks/queries';
import { toast } from '@/store';
import { haptics, zodResolver } from '@/utils';

const reviewSchema = z.object({
  title: z.string().min(2, 'Give your review a short title'),
  body: z.string().min(5, 'Share a bit more detail'),
});
type ReviewValues = z.infer<typeof reviewSchema>;

export function WriteReviewSheet({
  productId,
  visible,
  onClose,
}: {
  productId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(5);
  const createReview = useCreateReview(productId);
  const { control, handleSubmit, reset } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { title: '', body: '' },
  });

  const onSubmit = (values: ReviewValues) => {
    createReview.mutate(
      { rating, ...values },
      {
        onSuccess: () => {
          haptics.success();
          toast.success('Thank you for your review');
          reset();
          setRating(5);
          onClose();
        },
        onError: () => toast.error('Could not submit your review. Please try again.'),
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title" style={styles.title}>
        Write a Review
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)} hitSlop={8}>
            <Star
              size={IconSize.lg}
              color={colors.accent}
              fill={star <= rating ? colors.accent : 'transparent'}
              strokeWidth={1.75}
            />
          </Pressable>
        ))}
      </View>

      <FormField control={control} name="title" label="Title" placeholder="Sum it up in a few words" />
      <FormField
        control={control}
        name="body"
        label="Review"
        placeholder="What did you think of this fragrance?"
        multiline
        numberOfLines={4}
      />

      <Button
        label="Submit Review"
        variant="gradient"
        glow
        loading={createReview.isPending}
        onPress={handleSubmit(onSubmit)}
        style={styles.submit}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.md },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  submit: { marginTop: Spacing.sm },
});
