/**
 * CouponField — shared by Cart and Checkout. Applying stores the code in the cart store
 * (so it carries to checkout); the live discount comes from `useAppliedCoupon`, which
 * re-validates against the current subtotal.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, Text } from '@/components/ui';
import { Spacing } from '@/constants';
import { useAppliedCoupon, useValidateCoupon } from '@/hooks/queries';
import { useCartStore } from '@/store';
import { formatPrice, getErrorMessage, haptics } from '@/utils';

export function CouponField({ subtotal, currency }: { subtotal: number; currency: string }) {
  const setCoupon = useCartStore((s) => s.setCoupon);
  const applied = useAppliedCoupon(subtotal);
  const validate = useValidateCoupon();
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

  return (
    <Card style={styles.card}>
      <Text variant="overline" color="muted">
        COUPON CODE
      </Text>
      {applied.code ? (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text variant="bodyStrong" color={applied.error ? 'error' : 'accent'}>
              {applied.error
                ? `${applied.code} no longer applies to your bag`
                : applied.valid
                  ? `${applied.code} applied — ${formatPrice(applied.discount, currency)} off`
                  : `Checking ${applied.code}…`}
            </Text>
            {applied.error ? (
              <Text variant="caption" color="muted">
                {getErrorMessage(applied.error, 'Remove it to continue without a discount.')}
              </Text>
            ) : null}
          </View>
          <Button label="Remove" variant="ghost" size="sm" fullWidth={false} onPress={remove} />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Input
              value={input}
              onChangeText={(v) => {
                setInput(v);
                setError(null);
              }}
              placeholder="Enter code"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={apply}
              accessibilityLabel="Coupon code"
              containerStyle={styles.flex}
            />
            <Button
              label="Apply"
              variant="outline"
              size="sm"
              fullWidth={false}
              loading={validate.isPending}
              disabled={!input.trim()}
              onPress={apply}
            />
          </View>
          {error ? (
            <Text variant="caption" color="error" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  flex: { flex: 1 },
});
