/**
 * AddressFormScreen — create (`/addresses/new`) or edit (`/addresses/:id`) an address
 * with every field the backend model supports.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { StackHeader } from '@/components/layout';
import { Button, FormField, Loader, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/queries';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { addressFormSchema, emptyAddressForm, type AddressFormValues } from './schema';

export function AddressFormScreen() {
  const { colors } = useTheme();
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
        <View style={styles.center}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Account" title={isNew ? 'New Address' : 'Edit Address'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <FormField control={control} name="label" label="Label (optional)" placeholder="Home, Office…" autoCapitalize="words" />
          <FormField control={control} name="fullName" label="Full Name" autoCapitalize="words" textContentType="name" />
          <FormField control={control} name="phone" label="Phone" placeholder="+971 50 000 0000" keyboardType="phone-pad" textContentType="telephoneNumber" />
          <FormField control={control} name="addressLine" label="Address" placeholder="Street, building, villa" textContentType="streetAddressLine1" />
          <FormField control={control} name="landmark" label="Landmark (optional)" placeholder="Near…" />
          <FormField control={control} name="city" label="City" autoCapitalize="words" textContentType="addressCity" />
          <FormField control={control} name="state" label="State / Emirate (optional)" autoCapitalize="words" />
          <FormField control={control} name="postalCode" label="Postal Code (optional)" textContentType="postalCode" />
          <FormField control={control} name="country" label="Country" autoCapitalize="words" textContentType="countryName" />
          <View style={styles.switchRow}>
            <Text variant="bodyStrong">Use as my default address</Text>
            <Switch
              value={isDefault}
              onValueChange={(v) => setValue('isDefault', v, { shouldDirty: true })}
              trackColor={{ false: colors.surfaceSunken, true: colors.accent }}
              thumbColor={colors.surface}
              accessibilityLabel="Use as my default address"
            />
          </View>
          <Button
            label={isNew ? 'Save Address' : 'Save Changes'}
            variant="gradient"
            glow
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
});
