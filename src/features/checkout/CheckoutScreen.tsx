/**
 * CheckoutScreen — a 4-step flow (Address → Delivery → Payment → Review) with a progress
 * Stepper, a sticky action bar, an optional sign-in prompt for guests, and mock order
 * placement that clears the cart and routes to a success screen.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Truck, Wallet, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderSummary } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Button, Card, FormField, GlassSurface, Stepper, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { ordersService } from '@/services';
import { toast, useCartStore, useCartSummary, useSessionStore } from '@/store';
import { QueryKeys } from '@/hooks/queries';
import { haptics, zodResolver } from '@/utils';
import { addressSchema, type AddressValues } from './schema';
import { OptionRow } from './components/OptionRow';
import { OrderSuccess } from './components/OrderSuccess';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];

export function CheckoutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const summary = useCartSummary();
  const clearCart = useCartStore((s) => s.clear);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const user = useSessionStore((s) => s.user);

  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState<'card' | 'cod' | 'wallet'>('card');
  const [placedRef, setPlacedRef] = useState<string | null>(null);

  const { control, handleSubmit, getValues } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: user?.fullName ?? '', phone: '', address: '', city: '' },
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      ordersService.place({
        items,
        summary,
        shippingAddress: `${getValues('address')}, ${getValues('city')}`,
      }),
    onSuccess: (order) => {
      haptics.success();
      clearCart();
      void queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      setPlacedRef(order.reference);
    },
    onError: () => toast.error('We could not place your order. Please try again.'),
  });

  if (placedRef) {
    return <OrderSuccess reference={placedRef} />;
  }

  const next = () => {
    if (step === 0) {
      handleSubmit(() => setStep(1))();
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else placeOrder.mutate();
  };

  const back = () => (step === 0 ? router.back() : setStep(step - 1));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Secure Checkout" title="Checkout" onBack={back} />

      <View style={styles.stepper}>
        <Stepper steps={STEPS} activeIndex={step} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <View style={styles.section}>
              {!isAuthenticated ? (
                <Card variant="glass" style={styles.prompt}>
                  <Text variant="bodyStrong">Checking out as a guest</Text>
                  <Text variant="caption" color="secondary">
                    Sign in for faster checkout and to track your orders.
                  </Text>
                  <Button label="Sign in" variant="outline" size="sm" fullWidth={false} onPress={() => router.push('/(auth)/login')} style={styles.promptBtn} />
                </Card>
              ) : null}
              <Text variant="title">Shipping Address</Text>
              <FormField control={control} name="fullName" label="Full Name" placeholder="Your name" autoCapitalize="words" />
              <FormField control={control} name="phone" label="Phone" placeholder="+971 50 000 0000" keyboardType="phone-pad" />
              <FormField control={control} name="address" label="Address" placeholder="Street, building, villa" />
              <FormField control={control} name="city" label="City" placeholder="Dubai" autoCapitalize="words" />
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.section}>
              <Text variant="title">Delivery Method</Text>
              <OptionRow
                icon={<Truck size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                title="Standard Delivery"
                subtitle="3–5 business days · Complimentary over AED 250"
                selected={delivery === 'standard'}
                onPress={() => setDelivery('standard')}
              />
              <OptionRow
                icon={<Zap size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                title="Express Delivery"
                subtitle="Next business day · AED 30"
                selected={delivery === 'express'}
                onPress={() => setDelivery('express')}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.section}>
              <Text variant="title">Payment Method</Text>
              <OptionRow
                icon={<CreditCard size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                title="Credit / Debit Card"
                subtitle="Visa, Mastercard, Amex"
                selected={payment === 'card'}
                onPress={() => setPayment('card')}
              />
              <OptionRow
                icon={<Wallet size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                title="Digital Wallet"
                subtitle="Apple Pay · Google Pay"
                selected={payment === 'wallet'}
                onPress={() => setPayment('wallet')}
              />
              <OptionRow
                icon={<Truck size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                title="Cash on Delivery"
                subtitle="Pay when your order arrives"
                selected={payment === 'cod'}
                onPress={() => setPayment('cod')}
              />
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.section}>
              <Text variant="title">Review Order</Text>
              <Card>
                <Text variant="overline" color="muted">
                  SHIPPING TO
                </Text>
                <Text variant="bodyStrong">{getValues('fullName')}</Text>
                <Text variant="caption" color="secondary">
                  {getValues('address')}, {getValues('city')}
                </Text>
                <Text variant="caption" color="secondary">
                  {getValues('phone')}
                </Text>
              </Card>
              <Card>
                <OrderSummary summary={summary} />
              </Card>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <GlassSurface radius={0} intensity={70} bordered={false} style={[styles.bar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={[styles.barInner, { borderTopColor: colors.divider }]}>
          <View style={styles.totalRow}>
            <Text variant="caption" color="secondary">
              Total
            </Text>
            <Text variant="priceLarge" color="accent">
              {summary.currency} {summary.total}
            </Text>
          </View>
          <Button
            label={step === STEPS.length - 1 ? 'Place Order' : 'Continue'}
            variant="gradient"
            glow
            loading={placeOrder.isPending}
            onPress={next}
            style={styles.cta}
          />
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  stepper: { paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.lg },
  content: { paddingHorizontal: Layout.screenPadding, paddingBottom: 160 },
  section: { gap: Spacing.lg },
  prompt: { gap: Spacing.sm },
  promptBtn: { marginTop: Spacing.sm },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalRow: { gap: 2 },
  cta: { flex: 1 },
});
