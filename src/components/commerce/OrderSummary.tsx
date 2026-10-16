/**
 * OrderSummary — subtotal / shipping / discount / total breakdown shared by Cart &
 * Checkout. Money reads in ink; only the discount takes a status tint.
 */
import { StyleSheet, View } from 'react-native';

import { Divider, Text } from '@/components/ui';
import { Spacing } from '@/constants';
import type { CartSummary } from '@/types';
import { formatPrice } from '@/utils';

function Row({
  label,
  value,
  strong,
  positive,
}: {
  label: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
}) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text variant={strong ? 'bodyStrong' : 'body'} color={strong ? 'primary' : 'secondary'}>
        {label}
      </Text>
      <Text variant={strong ? 'priceLarge' : 'body'} color={positive ? 'success' : 'primary'}>
        {value}
      </Text>
    </View>
  );
}

export function OrderSummary({ summary, discount = 0 }: { summary: CartSummary; discount?: number }) {
  const { subtotal, shipping, total, currency } = summary;
  return (
    <View style={styles.wrap}>
      <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
      <Row label="Delivery" value={shipping === 0 ? 'Complimentary' : formatPrice(shipping, currency)} />
      {discount > 0 ? <Row label="Discount" value={`−${formatPrice(discount, currency)}`} positive /> : null}
      <Divider spacing={Spacing.xs} />
      <Row label="Total" value={formatPrice(total - discount, currency)} strong />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
