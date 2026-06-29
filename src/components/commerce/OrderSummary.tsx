/**
 * OrderSummary — subtotal / shipping / total breakdown shared by Cart & Checkout.
 */
import { StyleSheet, View } from 'react-native';

import { Divider, Text } from '@/components/ui';
import { Spacing } from '@/constants';
import type { CartSummary } from '@/types';
import { formatPrice } from '@/utils';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant={strong ? 'subtitle' : 'body'} color={strong ? 'primary' : 'secondary'}>
        {label}
      </Text>
      <Text variant={strong ? 'priceLarge' : 'body'} color={strong ? 'accent' : 'primary'}>
        {value}
      </Text>
    </View>
  );
}

export function OrderSummary({ summary }: { summary: CartSummary }) {
  const { subtotal, shipping, total, currency } = summary;
  return (
    <View style={styles.wrap}>
      <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
      <Row label="Shipping" value={shipping === 0 ? 'Complimentary' : formatPrice(shipping, currency)} />
      <Divider spacing={Spacing.xs} />
      <Row label="Total" value={formatPrice(total, currency)} strong />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
