/**
 * AddressFormScreen — create (`/addresses/new`) or edit (`/addresses/:id`) an address
 * with every field the backend model supports. Fields are grouped (Recipient / Address)
 * and the default switch lives in its own row; Save stays reachable at the end.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout';
import { Button, FormField, ListGroup, MenuRow, Skeleton, Text, Toggle } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/queries';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { addressFormSchema, emptyAddressForm, type AddressFormValues } from './schema';

export function AddressFormScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const user = useSessionStore((s) => s.user);
  const addresses = useAddresses(true);
  const existing = addresses.data?.find((a) => a.id === id);
  const create = useCreateAddress();
  const update = useUpdateAddress();

  const { control, handleSubmit, reset, setValue, formState } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: emptyAddressForm(user?.fullName),
  });

  useEffect(() => {
    if (existing) {
      const { id: _id, ...values } = existing;
      reset({ ...emptyAddressForm(), ...values, label: values.label ?? '', state: values.state ?? '', postalCode: values.postalCode ?? '', landmark: values.landmark ?? '' });
    }
  }, [existing, reset]);

  const isDefault = useWatch({ control, name: 'isDefault' });
  const pending = create.isPending || update.isPending;
  const onSubmit = (values: AddressFormValues) => {
    const done = {
      onSuccess: () => {
        haptics.success();
        toast.success(isNew ? 'Address added' : 'Address updated');
        router.back();
      },
      onError: (e: unknown) => toast.error(getErrorMessage(e, "Couldn't save this address.")),
    };
    if (isNew) create.mutate(values, done);
    else update.mutate({ id, input: values }, done);
  };

  if (!isNew && addresses.isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="Account" title="Edit Address" />
        <View style={[styles.content, { gap: Spacing.lg }]} accessible accessibilityLabel="Loading address">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ gap: Spacing.sm }}>
              <Skeleton width={90} height={9} />
              <Skeleton width="100%" height={52} radius={2} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Account" title={isNew ? 'New Address' : 'Edit Address'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.giant }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text variant="overline" color="muted">
              RECIPIENT
            </Text>
            <FormField control={control} name="label" label="Label (optional)" placeholder="Home, Office…" autoCapitalize="words" />
            <FormField control={control} name="fullName" label="Full Name" autoCapitalize="words" autoComplete="name" textContentType="name" />
            <FormField control={control} name="phone" label="Phone" placeholder="+971 50 000 0000" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
          </View>

          <View style={[styles.section, styles.ruled, { borderTopColor: colors.divider }]}>
            <Text variant="overline" color="muted">
              ADDRESS
            </Text>
            <FormField control={control} name="addressLine" label="Street Address" placeholder="Street, building, villa" autoComplete="street-address" textContentType="streetAddressLine1" />
            <FormField control={control} name="landmark" label="Landmark (optional)" placeholder="Near…" />
            <View style={styles.pair}>
              <FormField control={control} name="city" label="City" autoCapitalize="words" textContentType="addressCity" containerStyle={styles.flex} />
              <FormField control={control} name="postalCode" label="Postal Code" placeholder="Optional" autoComplete="postal-code" textContentType="postalCode" containerStyle={styles.flex} />
            </View>
            <FormField control={control} name="state" label="State / Emirate (optional)" autoCapitalize="words" textContentType="addressState" />
            <FormField control={control} name="country" label="Country" autoCapitalize="words" textContentType="countryName" />
          </View>

          <ListGroup>
            <MenuRow
              title="Default address"
              subtitle="Pre-selected at checkout"
              showChevron={false}
              right={
                <Toggle
                  value={isDefault}
                  onValueChange={(v) => setValue('isDefault', v, { shouldDirty: true })}
                  accessibilityLabel="Use as my default address"
                />
              }
            />
          </ListGroup>

          <Button
            label={isNew ? 'Save Address' : 'Save Changes'}
            loading={pending}
            disabled={pending || (!isNew && !formState.isDirty)}
            onPress={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Layout.screenPadding, paddingTop: Spacing.xl, gap: Spacing.xxl },
  section: { gap: Spacing.lg },
  ruled: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.xl },
  pair: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
});
