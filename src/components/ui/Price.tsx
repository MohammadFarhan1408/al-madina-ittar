/**
 * Price — formatted price with optional original (strikethrough) and discount. Prices
 * read in the primary ink color; gold is not used for money (it reads as a promo).
 */
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Money } from '@/types';
import { calcDiscountPercent, formatPrice } from '@/utils';
import { Text, type TextProps } from './Text';

export type PriceProps = {
  amount: Money;
  originalAmount?: Money;
  currency?: string;
  variant?: TextProps['variant'];
  showDiscount?: boolean;
};

export function Price({
  amount,
  originalAmount,
  currency = 'AED',
  variant = 'price',
  showDiscount = true,
}: PriceProps) {
  const { colors } = useTheme();
  const discount = calcDiscountPercent(amount, originalAmount);

  return (
    <View style={styles.row}>
      <Text variant={variant} color="primary">
        {formatPrice(amount, currency)}
      </Text>
      {originalAmount && discount ? (
        <Text
          variant="caption"
          color="muted"
          style={styles.struck}
          accessibilityLabel={`was ${formatPrice(originalAmount, currency)}`}
        >
          {formatPrice(originalAmount, currency)}
        </Text>
      ) : null}
      {showDiscount && discount ? (
        <Text variant="label" colorValue={colors.accent}>
          −{discount}%
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, flexWrap: 'wrap' },
  struck: { textDecorationLine: 'line-through' },
});
