/**
 * CheckoutScreen — a 4-step flow (Address → Delivery → Payment → Review) with a progress
 * Stepper, a sticky action bar, an optional sign-in prompt for guests, saved-address
 * selection, a coupon field, and order placement that routes to a live-tracking
 * success screen (polls payment status, offers retry on failure).
 *
 * Presentation: each step is one calm column of hairline option rows; the Review step
 * recaps every choice with "Edit" links back to its step, lists the pieces, and ends on
 * the summary. The action bar always shows the payable total and names the next step;
 * "Place Order" is the flow's single gold moment. Logic, payloads and the idempotency
 * key are unchanged.
 */
import {
  CreditCard,
  Lock,
  LogIn,
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
  Wallet,
  Zap,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderSummary } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Button, EmptyState, FormField, GlassSurface, Stepper, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { AppConfig } from '@/core/config';
import { addressesService } from '@/services';
import { openStripeCheckoutForOrder, paymentReturnUrl } from '@/services/payments/checkout-browser';
import { toast, useCartStore, useCartSummary, useSessionStore } from '@/store';
import { QueryKeys, useAddresses, useAppliedCoupon, usePlaceOrder } from '@/hooks/queries';
import { formatPrice, formatVolume, haptics, unitPrice, uuid, zodResolver } from '@/utils';
import type { Order } from '@/types';
import { foldAddress, makeAddressSchema, type AddressValues } from './schema';
import { CouponField } from '../cart/components/CouponField';
import { OptionRow } from './components/OptionRow';
import { OrderSuccess } from './components/OrderSuccess';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];
const PAYMENT_LABEL = { card: 'Credit / Debit Card', wallet: 'Digital Wallet', cod: 'Cash on Delivery' } as const;
const DELIVERY_LABEL = { standard: 'Standard Delivery', express: 'Express Delivery' } as const;
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
          returnUrl: payment === 'cod' ? undefined : paymentReturnUrl(),
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

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="Secure Checkout" title="Checkout" />
        <EmptyState
          icon={<ShoppingBag size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
          title="Your bag is empty"
          message="Add a fragrance to your bag to check out."
          actionLabel="Discover the collection"
          actionVariant="primary"
          onAction={() => router.replace('/(tabs)/shop')}
        />
      </View>
    );
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

  const payable = checkoutSummary.total - discount;
  const isLast = step === STEPS.length - 1;
  const ctaLabel = isLast ? 'Place Order' : `Continue to ${STEPS[step + 1]}`;
  const standardFee = computeShipping(summary.subtotal, 'standard');
  const expressFee = computeShipping(summary.subtotal, 'express');
  const iconColor = colors.text.secondary;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Secure Checkout" title={STEPS[step]} onBack={back} />

      <View style={[styles.stepper, { borderBottomColor: colors.divider }]}>
        <Stepper steps={STEPS} activeIndex={step} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={step} entering={FadeIn.duration(260)} style={styles.section}>
            {step === 0 ? (
              <>
                {!isAuthenticated ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sign in for faster checkout"
                    onPress={() => router.push('/(auth)/login')}
                    style={({ pressed }) => [
                      styles.guest,
                      { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <LogIn size={18} color={iconColor} strokeWidth={1.5} />
                    <View style={styles.flex}>
                      <Text variant="bodyStrong">Checking out as a guest</Text>
                      <Text variant="caption" color="secondary">
                        Sign in for faster checkout and order tracking.
                      </Text>
                    </View>
                    <Text variant="label" uppercase style={styles.underline}>
                      Sign in
                    </Text>
                  </Pressable>
                ) : null}

                <SectionTitle eyebrow="Step 1 of 4" title="Where should we deliver?" />

                {isAuthenticated && savedAddresses.length > 0 ? (
                  <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Saved addresses">
                    {savedAddresses.map((address) => (
                      <OptionRow
                        key={address.id}
                        icon={<MapPin size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                        title={address.label ?? address.fullName}
                        subtitle={`${address.addressLine}, ${address.city}`}
                        selected={selectedAddressId === address.id}
                        onPress={() => selectSavedAddress(address.id)}
                      />
                    ))}
                    <OptionRow
                      icon={<Plus size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                      title="Use a new address"
                      selected={showAddressForm}
                      onPress={startNewAddress}
                    />
                  </View>
                ) : null}

                {showAddressForm ? (
                  <View style={styles.form}>
                    {!isAuthenticated ? (
                      <FormField
                        control={control}
                        name="email"
                        label="Email"
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        hint="For your order confirmation and tracking."
                      />
                    ) : null}
                    <FormField
                      control={control}
                      name="fullName"
                      label="Full Name"
                      placeholder="Your name"
                      autoCapitalize="words"
                      autoComplete="name"
                      textContentType="name"
                    />
                    <FormField
                      control={control}
                      name="phone"
                      label="Phone"
                      placeholder="+971 50 000 0000"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                    />
                    <FormField
                      control={control}
                      name="address"
                      label="Address"
                      placeholder="Street, building, villa"
                      autoComplete="street-address"
                      textContentType="fullStreetAddress"
                    />
                    <FormField
                      control={control}
                      name="city"
                      label="City"
                      placeholder="Dubai"
                      autoCapitalize="words"
                      textContentType="addressCity"
                    />
                  </View>
                ) : null}
              </>
            ) : null}

            {step === 1 ? (
              <>
                <SectionTitle eyebrow="Step 2 of 4" title="How fast would you like it?" />
                <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Delivery method">
                  <OptionRow
                    icon={<Truck size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                    title="Standard Delivery"
                    subtitle={`3–5 business days · Complimentary over ${formatPrice(AppConfig.freeShippingThreshold, summary.currency)}`}
                    meta={standardFee === 0 ? 'Free' : formatPrice(standardFee, summary.currency)}
                    selected={delivery === 'standard'}
                    onPress={() => setDelivery('standard')}
                  />
                  <OptionRow
                    icon={<Zap size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                    title="Express Delivery"
                    subtitle="Next business day"
                    meta={formatPrice(expressFee, summary.currency)}
                    selected={delivery === 'express'}
                    onPress={() => setDelivery('express')}
                  />
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <SectionTitle eyebrow="Step 3 of 4" title="How would you like to pay?" />
                <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Payment method">
                  <OptionRow
                    icon={<CreditCard size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                    title="Credit / Debit Card"
                    subtitle="Visa, Mastercard, Amex"
                    selected={payment === 'card'}
                    onPress={() => setPayment('card')}
                  />
                  <OptionRow
                    icon={<Wallet size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                    title="Digital Wallet"
                    subtitle="Apple Pay · Google Pay"
                    selected={payment === 'wallet'}
                    onPress={() => setPayment('wallet')}
                  />
                  <OptionRow
                    icon={<Truck size={IconSize.sm} color={iconColor} strokeWidth={1.5} />}
                    title="Cash on Delivery"
                    subtitle="Pay when your order arrives"
                    selected={payment === 'cod'}
                    onPress={() => setPayment('cod')}
                  />
                </View>
                {payment !== 'cod' ? (
                  <View style={styles.secureNote}>
                    <Lock size={13} color={colors.text.muted} strokeWidth={1.5} />
                    <Text variant="caption" color="muted" style={styles.flex}>
                      After you place the order, you will complete payment on Stripe&apos;s secure page.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <SectionTitle eyebrow="Step 4 of 4" title="Review your order" />

                <RecapRow label="Deliver to" onEdit={() => setStep(0)}>
                  <Text variant="bodyStrong">{getValues('fullName')}</Text>
                  <Text variant="caption" color="secondary">
                    {getValues('address')}, {getValues('city')}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {getValues('phone')}
                  </Text>
                </RecapRow>
                <RecapRow label="Delivery" onEdit={() => setStep(1)}>
                  <Text variant="body">{DELIVERY_LABEL[delivery]}</Text>
                </RecapRow>
                <RecapRow label="Payment" onEdit={() => setStep(2)}>
                  <Text variant="body">{PAYMENT_LABEL[payment]}</Text>
                </RecapRow>

                <View style={styles.items}>
                  <Text variant="overline" color="muted">
                    {summary.itemCount} {summary.itemCount === 1 ? 'PIECE' : 'PIECES'}
                  </Text>
                  {items.map((item) => (
                    <View key={item.product.id} style={styles.itemRow}>
                      <View style={[styles.itemThumb, { backgroundColor: colors.imageWell }]}>
                        <Image source={{ uri: item.product.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />
                      </View>
                      <View style={styles.flex}>
                        <Text variant="bodyStrong" numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text variant="caption" color="muted">
                          {[item.volumeMl ? formatVolume(item.volumeMl) : null, `Qty ${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </Text>
                      </View>
                      <Text variant="price">
                        {formatPrice(unitPrice(item.product, item.volumeMl) * item.quantity, item.product.currency)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.couponWrap, { borderTopColor: colors.divider }]}>
                  <CouponField subtotal={summary.subtotal} currency={summary.currency} />
                </View>

                <View style={styles.summary}>
                  <OrderSummary summary={checkoutSummary} discount={discount} />
                </View>
              </>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GlassSurface radius={0} intensity={80} bordered={false} style={styles.bar}>
        <View
          style={[
            styles.barInner,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              backgroundColor: colors.tabBar,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <View style={styles.totalCol} accessible accessibilityLabel={`Total ${formatPrice(payable, checkoutSummary.currency)}`}>
            <Text variant="overline" color="muted">
              TOTAL
            </Text>
            <Text variant="subtitle" numberOfLines={1}>
              {formatPrice(payable, checkoutSummary.currency)}
            </Text>
          </View>
          <Button
            label={ctaLabel}
            variant={isLast ? 'gradient' : 'primary'}
            loading={placeOrder.isPending}
            onPress={next}
            style={styles.cta}
          />
        </View>
      </GlassSurface>
    </View>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text variant="overline" color="accent" uppercase>
        {eyebrow}
      </Text>
      <Text variant="heading" style={styles.sectionHeading} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

function RecapRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.recap, { borderBottomColor: colors.divider }]}>
      <View style={styles.recapHead}>
        <Text variant="overline" color="muted">
          {label.toUpperCase()}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label.toLowerCase()}`}
          hitSlop={HitSlop}
          onPress={onEdit}
          style={({ pressed }) => [styles.edit, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text variant="label" color="secondary" uppercase style={styles.underline}>
            Edit
          </Text>
        </Pressable>
      </View>
      <View style={styles.recapBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  stepper: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl },
  section: { gap: Spacing.xl },
  sectionTitle: { gap: Spacing.xs },
  sectionHeading: { fontSize: 26, lineHeight: 32 },
  options: { gap: Spacing.sm },
  form: { gap: Spacing.lg },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xs,
  },
  underline: { textDecorationLine: 'underline' },
  secureNote: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  recap: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: Spacing.lg, gap: Spacing.sm },
  recapHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recapBody: { gap: 2 },
  edit: { minHeight: 32, justifyContent: 'center' },
  items: { gap: Spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemThumb: { width: 48, height: 60, borderRadius: Radius.xs, overflow: 'hidden' },
  couponWrap: { borderTopWidth: StyleSheet.hairlineWidth },
  summary: { paddingTop: Spacing.sm },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalCol: { gap: 2, minWidth: 96 },
  cta: { flex: 1, alignSelf: 'center' },
});
