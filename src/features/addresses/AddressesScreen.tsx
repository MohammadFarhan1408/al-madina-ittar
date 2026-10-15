/**
 * AddressesScreen — the signed-in user's address book: add, edit, delete, set default.
 */
import { MapPin, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/layout';
import { Badge, Button, Card, EmptyState, ErrorState, Loader, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useAddresses, useRemoveAddress, useUpdateAddress } from '@/hooks/queries';
import { toast, useSessionStore } from '@/store';
import type { Address } from '@/types';
import { getErrorMessage, haptics } from '@/utils';
import { foldAddress } from '../checkout/schema';

export function AddressesScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const { data, isLoading, isError, refetch, isRefetching } = useAddresses(isAuthenticated);
  const update = useUpdateAddress();
  const remove = useRemoveAddress();

  const icon = <MapPin size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />;
  const addNew = () => router.push({ pathname: '/addresses/[id]', params: { id: 'new' } });

  const confirmRemove = (a: Address) =>
    Alert.alert('Remove address?', `${a.label || a.fullName} will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          remove.mutate(a.id, {
            onSuccess: () => haptics.success(),
            onError: (e) => toast.error(getErrorMessage(e, "Couldn't remove this address.")),
          }),
      },
    ]);

  const makeDefault = (a: Address) =>
    update.mutate(
      { id: a.id, input: { isDefault: true } },
      { onError: (e) => toast.error(getErrorMessage(e, "Couldn't update your default address.")) },
    );

  let body;
  if (!isAuthenticated) {
    body = (
      <EmptyState
        icon={icon}
        title="Sign in to manage addresses"
        message="Saved addresses make checkout faster."
        actionLabel="Sign in"
        onAction={() => router.push('/(auth)/login')}
      />
    );
  } else if (isLoading) {
    body = (
      <View style={styles.center}>
        <Loader />
      </View>
    );
  } else if (isError) {
    body = <ErrorState onRetry={() => refetch()} />;
  } else if (!data?.length) {
    body = (
      <EmptyState
        icon={icon}
        title="No saved addresses"
        message="Add one now and it will be ready at checkout."
        actionLabel="Add an address"
        onAction={addNew}
      />
    );
  } else {
    body = (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />}
      >
        {data.map((a) => (
          <Card key={a.id} style={styles.card}>
            <View style={styles.row}>
              <Text variant="bodyStrong">{a.label || a.fullName}</Text>
              {a.isDefault ? <Badge label="Default" tone="gold" /> : null}
            </View>
            <Text variant="caption" color="secondary">
              {a.label ? `${a.fullName} · ` : ''}
              {a.phone}
            </Text>
            <Text variant="body" color="secondary">
              {[foldAddress(a), a.city, a.country].filter(Boolean).join(', ')}
            </Text>
            <View style={styles.actions}>
              <Button
                label="Edit"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => router.push({ pathname: '/addresses/[id]', params: { id: a.id } })}
              />
              {!a.isDefault ? (
                <Button label="Make default" variant="ghost" size="sm" fullWidth={false} onPress={() => makeDefault(a)} />
              ) : null}
              <Button label="Remove" variant="ghost" size="sm" fullWidth={false} onPress={() => confirmRemove(a)} />
            </View>
          </Card>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Account"
        title="Saved Addresses"
        right={
          isAuthenticated && data?.length ? (
            <Button label="Add" size="sm" fullWidth={false} leftIcon={<Plus size={IconSize.sm} color={colors.text.onAccent} />} onPress={addNew} />
          ) : null
        }
      />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  card: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
});
