/**
 * CheckoutScreen — a 4-step flow (Address → Delivery → Payment → Review) with a progress
 * Stepper, a sticky action bar, an optional sign-in prompt for guests, saved-address
 * selection, a coupon field, and order placement that routes to a live-tracking
 * success screen (polls payment status, offers retry on failure).
 */
import { CreditCard, MapPin, Plus, Truck, Wallet, Zap } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderSummary } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Button, Card, FormField, GlassSurface, Stepper, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { AppConfig } from '@/core/config';
import { addressesService } from '@/services';
import { openStripeCheckoutForOrder } from '@/services/payments/checkout-browser';
import { toast, useCartStore, useCartSummary, useSessionStore } from '@/store';
import { QueryKeys, useAddresses, useAppliedCoupon, usePlaceOrder } from '@/hooks/queries';
import { haptics, uuid, zodResolver } from '@/utils';
import type { Order } from '@/types';
import { foldAddress, makeAddressSchema, type AddressValues } from './schema';
import { CouponField } from '../cart/components/CouponField';
import { OptionRow } from './components/OptionRow';
import { OrderSuccess } from './components/OrderSuccess';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];
const EXPRESS_DELIVERY_FEE = 30; // mirrors the backend's EXPRESS_DELIVERY_FEE (business.ts)

function computeShipping(subtotal: number, delivery: 'standard' | 'express'): number {
  const base = subtotal === 0 || subtotal >= AppConfig.freeShippingThreshold ? 0 : AppConfig.flatShippingFee;
  return base + (delivery === 'express' ? EXPRESS_DELIVERY_FEE : 0);
}

export function CheckoutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const summary = useCartSummary();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const user = useSessionStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState<'card' | 'cod' | 'wallet'>('card');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  // One key per checkout attempt — resent unchanged on retry so a double-tap
  // or network retry can't create two orders/charges.
  const [idempotencyKey] = useState(() => uuid());

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(true);

  const queryClient = useQueryClient();
  const addressSchema = useMemo(() => makeAddressSchema(!isAuthenticated), [isAuthenticated]);
  const { control, handleSubmit, getValues, reset } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: user?.fullName ?? '', phone: '', address: '', city: '', email: '' },
  });

  const addresses = useAddresses(isAuthenticated);
  const savedAddresses = addresses.data ?? [];

  const placeOrder = usePlaceOrder();
  const coupon = useAppliedCoupon(summary.subtotal);

  const shipping = computeShipping(summary.subtotal, delivery);
  const discount = coupon.discount;
  const checkoutSummary = useMemo(
    () => ({ ...summary, shipping, total: summary.subtotal + shipping }),
    [summary, shipping],
  );

  const selectSavedAddress = (id: string) => {
    const address = savedAddresses.find((a) => a.id === id);
    if (!address) return;
    setSelectedAddressId(id);
    setShowAddressForm(false);
    reset({ fullName: address.fullName, phone: address.phone, address: foldAddress(address), city: address.city, email: '' });
  };

  const startNewAddress = () => {
    setSelectedAddressId(null);
    setShowAddressForm(true);
    reset({ fullName: user?.fullName ?? '', phone: '', address: '', city: '', email: '' });
  };

  const submitOrder = () => {
    const values = getValues();
    placeOrder.mutate(
      {
        input: {
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, volumeMl: i.volumeMl })),
          shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            address: values.address,
            city: values.city,
          },
          deliveryMethod: delivery,
          paymentMethod: payment,
          guestEmail: isAuthenticated ? undefined : values.email.trim(),
          couponCode: coupon.valid ? (coupon.code ?? undefined) : undefined,
          idempotencyKey,
        },
        cartItems: items,
      },
      {
        onSuccess: (order) => {
          haptics.success();
          // Only persist a genuinely new address — selecting a saved one shouldn't re-save it.
          if (isAuthenticated && !selectedAddressId) {
            void addressesService
              .create({
                fullName: values.fullName,
                phone: values.phone,
                addressLine: values.address,
                country: 'United Arab Emirates',
                city: values.city,
                isDefault: false,
              })
              .catch(() => undefined);
          }
          setPlacedOrder(order);
          useCartStore.getState().clear();
          // Card/wallet: the backend already created a Stripe Checkout session; open it
          // over the confirmation screen, then refetch once the customer closes it.
          if (payment !== 'cod') {
            const guestEmail = isAuthenticated ? undefined : values.email.trim();
            void openStripeCheckoutForOrder(order.id, guestEmail)
              .catch(() => undefined)
              .finally(() => {
                queryClient.invalidateQueries({ queryKey: QueryKeys.order(order.id) });
                queryClient.invalidateQueries({ queryKey: QueryKeys.orderPayments(order.id) });
              });
          }
        },
        onError: () => toast.error('We could not place your order. Please try again.'),
      },
    );
  };

  if (placedOrder) {
    return <OrderSuccess order={placedOrder} guestEmail={isAuthenticated ? undefined : getValues('email').trim()} />;
  }

  const next = () => {
    if (step === 0) {
      handleSubmit(() => setStep(1))();
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else submitOrder();
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

              {isAuthenticated && savedAddresses.length > 0 ? (
                <View style={styles.section}>
                  {savedAddresses.map((address) => (
                    <OptionRow
                      key={address.id}
                      icon={<MapPin size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                      title={address.label ?? address.fullName}
                      subtitle={`${address.addressLine}, ${address.city}`}
                      selected={selectedAddressId === address.id}
                      onPress={() => selectSavedAddress(address.id)}
                    />
                  ))}
                  <OptionRow
                    icon={<Plus size={IconSize.md} color={colors.accent} strokeWidth={1.75} />}
                    title="Add a new address"
                    selected={showAddressForm}
                    onPress={startNewAddress}
                  />
                </View>
              ) : null}

              {showAddressForm ? (
                <View style={styles.section}>
                  {!isAuthenticated ? (
                    <FormField
                      control={control}
                      name="email"
                      label="Email"
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  ) : null}
                  <FormField control={control} name="fullName" label="Full Name" placeholder="Your name" autoCapitalize="words" />
                  <FormField control={control} name="phone" label="Phone" placeholder="+971 50 000 0000" keyboardType="phone-pad" />
                  <FormField control={control} name="address" label="Address" placeholder="Street, building, villa" />
                  <FormField control={control} name="city" label="City" placeholder="Dubai" autoCapitalize="words" />
                </View>
              ) : null}
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

              <CouponField subtotal={summary.subtotal} currency={summary.currency} />

              <Card>
                <OrderSummary summary={checkoutSummary} discount={discount} />
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
              {checkoutSummary.currency} {checkoutSummary.total - discount}
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
