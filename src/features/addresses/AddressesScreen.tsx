/**
 * AddressesScreen — the signed-in user's address book: add, edit, delete, set default.
 *
 * Each address is a quiet hairline card (label in serif, a gold "Default" marker, the
 * recipient and address lines) with text actions underneath. The default address leads
 * the list. Loading → skeleton cards; guests and empty books get a clear next step.
 */
import { MapPin, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { StackHeader } from '@/components/layout';
import { EmptyState, ErrorState, IconButton, Skeleton, Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Radius, Spacing } from '@/constants';
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

  const icon = <MapPin size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />;
  const addNew = () => router.push({ pathname: '/addresses/[id]', params: { id: 'new' } });
  const sorted = [...(data ?? [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

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

  const makeDefault = (a: Address) => {
    haptics.selection();
    update.mutate(
      { id: a.id, input: { isDefault: true } },
      { onError: (e) => toast.error(getErrorMessage(e, "Couldn't update your default address.")) },
    );
  };

  let body;
  if (!isAuthenticated) {
    body = (
      <EmptyState
        icon={icon}
        title="Sign in to manage addresses"
        message="Saved addresses make checkout faster."
        actionLabel="Sign in"
        actionVariant="primary"
        onAction={() => router.push('/(auth)/login')}
      />
    );
  } else if (isLoading) {
    body = (
      <View style={styles.content} accessible accessibilityLabel="Loading addresses">
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} style={[styles.card, { borderColor: colors.border }]}>
            <Skeleton width="40%" height={16} />
            <Skeleton width="55%" height={11} />
            <Skeleton width="85%" height={11} />
            <Skeleton width="50%" height={11} />
          </View>
        ))}
      </View>
    );
  } else if (isError) {
    body = <ErrorState onRetry={() => refetch()} />;
  } else if (!sorted.length) {
    body = (
      <EmptyState
        icon={icon}
        title="No saved addresses"
        message="Add one now and it will be ready at checkout."
        actionLabel="Add an address"
        actionVariant="primary"
        onAction={addNew}
      />
    );
  } else {
    body = (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.text.secondary} />}
      >
        {sorted.map((a) => (
          <Animated.View
            key={a.id}
            entering={FadeIn.duration(250)}
            layout={LinearTransition.duration(240)}
            style={[
              styles.card,
              {
                borderColor: a.isDefault ? colors.borderStrong : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View style={styles.cardHead}>
              <Text variant="title" numberOfLines={1} style={styles.flex}>
                {a.label || a.fullName}
              </Text>
              {a.isDefault ? (
                <View style={styles.defaultMark}>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <Text variant="overline" color="accent">
                    DEFAULT
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.lines}>
              <Text variant="body" color="secondary">
                {[foldAddress(a), a.city, a.country].filter(Boolean).join(', ')}
              </Text>
              <Text variant="caption" color="muted">
                {a.label ? `${a.fullName} · ` : ''}
                {a.phone}
              </Text>
            </View>
            <View style={[styles.actions, { borderTopColor: colors.divider }]}>
              <TextAction label="Edit" onPress={() => router.push({ pathname: '/addresses/[id]', params: { id: a.id } })} />
              {!a.isDefault ? <TextAction label="Make default" onPress={() => makeDefault(a)} /> : null}
              <View style={styles.flex} />
              <TextAction label="Remove" danger onPress={() => confirmRemove(a)} />
            </View>
          </Animated.View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a new address"
          onPress={addNew}
          style={({ pressed }) => [styles.addRow, { borderColor: colors.borderStrong, opacity: pressed ? 0.6 : 1 }]}
        >
          <Plus size={16} color={colors.text.primary} strokeWidth={1.5} />
          <Text variant="label" uppercase>
            Add a new address
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader
        overline="Account"
        title="Addresses"
        right={
          isAuthenticated && sorted.length ? (
            <IconButton accessibilityLabel="Add a new address" onPress={addNew}>
              <Plus size={20} color={colors.text.primary} strokeWidth={1.5} />
            </IconButton>
          ) : null
        }
      />
      {body}
    </View>
  );
}

function TextAction({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Text variant="label" uppercase color={danger ? 'error' : 'primary'} style={styles.underline}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Layout.screenPadding, gap: Spacing.md, paddingBottom: Spacing.giant },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  defaultMark: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  lines: { gap: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  textAction: { minHeight: 40, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
});
