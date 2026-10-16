/**
 * CouponField — shared by Cart and Checkout. Applying stores the code in the cart store
 * (so it carries to checkout); the live discount comes from `useAppliedCoupon`, which
 * re-validates against the current subtotal.
 *
 * Collapsed to a single "Add a promo code" row until needed; an applied code shows as a
 * quiet confirmation line with a Remove link.
 */
import { Check, Plus, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Input, Text } from '@/components/ui';
import { HitSlop, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useAppliedCoupon, useValidateCoupon } from '@/hooks/queries';
import { useCartStore } from '@/store';
import { formatPrice, getErrorMessage, haptics } from '@/utils';

export function CouponField({ subtotal, currency }: { subtotal: number; currency: string }) {
  const { colors } = useTheme();
  const setCoupon = useCartStore((s) => s.setCoupon);
  const applied = useAppliedCoupon(subtotal);
  const validate = useValidateCoupon();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setError(null);
    validate.mutate(
      { code, subtotal },
      {
        onSuccess: (preview) => {
          if (!preview.valid) return setError("This code isn't valid.");
          setCoupon(preview.coupon.code);
          setInput('');
          setOpen(false);
          haptics.success();
        },
        onError: (err) => setError(getErrorMessage(err, "This code isn't valid for your bag.")),
      },
    );
  };

  const remove = () => {
    haptics.light();
    setCoupon(null);
    setError(null);
  };

  const frame = [styles.frame, { borderColor: colors.divider }];

  if (applied.code) {
    const statusColor = applied.error ? colors.error.base : colors.success.base;
    return (
      <Animated.View entering={FadeIn.duration(220)} style={[frame, styles.row]}>
        {applied.error ? (
          <TriangleAlert size={16} color={statusColor} strokeWidth={1.5} />
        ) : (
          <Check size={16} color={statusColor} strokeWidth={1.75} />
        )}
        <View style={styles.flex} accessibilityLiveRegion="polite">
          <Text variant="bodyStrong" colorValue={applied.error ? colors.error.base : colors.text.primary}>
            {applied.error
              ? `${applied.code} no longer applies`
              : applied.valid
                ? `${applied.code} · ${formatPrice(applied.discount, currency)} off`
                : `Checking ${applied.code}…`}
          </Text>
          {applied.error ? (
            <Text variant="caption" color="muted">
              {getErrorMessage(applied.error, 'Remove it to continue without a discount.')}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove code ${applied.code}`}
          hitSlop={HitSlop}
          onPress={remove}
          style={styles.link}
        >
          <Text variant="label" color="secondary" uppercase style={styles.underline}>
            Remove
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  if (!open) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a promo code"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [frame, styles.row, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text variant="body" style={styles.flex}>
          Add a promo code
        </Text>
        <Plus size={16} color={colors.text.secondary} strokeWidth={1.5} />
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(220)} style={[frame, styles.openWrap]}>
      <Text variant="overline" color="muted">
        PROMO CODE
      </Text>
      <Input
          value={input}
          onChangeText={(v) => {
            setInput(v);
            setError(null);
          }}
          placeholder="Enter code"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={apply}
          accessibilityLabel="Promo code"
          error={error ?? undefined}
          rightIcon={
            validate.isPending ? (
              <ActivityIndicator size="small" color={colors.text.secondary} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Apply promo code"
                accessibilityState={{ disabled: !input.trim() }}
                disabled={!input.trim()}
                hitSlop={HitSlop}
                onPress={apply}
                style={({ pressed }) => [styles.applyInline, { opacity: !input.trim() ? 0.35 : pressed ? 0.5 : 1 }]}
              >
                <Text variant="label" uppercase>
                  Apply
                </Text>
              </Pressable>
            )
          }
        />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /** Bottom rule only — the row above (last bag line / checkout section) supplies the top rule. */
  frame: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 56 },
  openWrap: { gap: Spacing.sm, paddingVertical: Spacing.lg },
  flex: { flex: 1 },
  link: { minHeight: 44, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  applyInline: { minHeight: 44, justifyContent: 'center', paddingLeft: Spacing.sm },
});
