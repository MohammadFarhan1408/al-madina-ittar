/**
 * ProfileScreen (Account tab) — session-aware account hub.
 *
 * Signed in: an editorial identity block (avatar, name, email, tier · member since)
 * that opens Edit Profile, three tappable figures (orders, saved, bag), then grouped,
 * hairline-ruled menus. Guest: a short invitation with Sign in / Create account.
 * Sign out asks for confirmation. Every destination is an existing route.
 */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Heart,
  Info,
  LogOut,
  Mail,
  MapPin,
  Package,
  Settings as SettingsIcon,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Divider, MenuRow, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useOrders } from '@/hooks/queries';
import {
  selectCartCount,
  selectWishlistCount,
  toast,
  useCartStore,
  useSessionStore,
  useWishlistStore,
} from '@/store';
import { haptics } from '@/utils';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, signOut } = useSessionStore();
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const cartCount = useCartStore(selectCartCount);
  const { data: ordersPage } = useOrders();
  const ordersCount = ordersPage?.total ?? 0;

  const icon = (Ic: LucideIcon) => <Ic size={18} color={colors.text.secondary} strokeWidth={1.5} />;
  const memberYear = user?.memberSince ? new Date(user.memberSince).getFullYear() : null;

  const confirmSignOut = () => {
    haptics.warning();
    Alert.alert('Sign out?', 'Your bag and saved pieces stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          toast.info('You have been signed out');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: Layout.tabBarClearance + Spacing.lg },
      ]}
    >
      <Text variant="overline" color="accent">
        AL MADINA · ACCOUNT
      </Text>

      {/* Identity */}
      {isAuthenticated && user ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${user.fullName}, ${user.email}. Edit profile`}
            onPress={() => router.push('/account/edit-profile')}
            style={({ pressed }) => [styles.identity, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Avatar uri={user.avatar} name={user.fullName} size="lg" />
            <View style={styles.flex}>
              <Text variant="heading" numberOfLines={1} style={styles.name}>
                {user.fullName}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {user.email}
              </Text>
              <Text variant="overline" color="muted" style={styles.tier} uppercase>
                {[user.tier !== 'Guest' ? `${user.tier}` : null, memberYear ? `Since ${memberYear}` : null]
                  .filter(Boolean)
                  .join('  ·  ')}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.text.muted} strokeWidth={1.5} />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.guest}>
          <Text variant="display" accessibilityRole="header">
            Account
          </Text>
          <Text variant="body" color="secondary" style={styles.guestCopy}>
            Sign in to track your orders, keep your saved pieces across devices and check out faster.
          </Text>
          <View style={styles.guestActions}>
            <Button label="Sign In" onPress={() => router.push('/(auth)/login')} style={styles.flex} />
            <Button
              label="Create Account"
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.flex}
            />
          </View>
        </Animated.View>
      )}

      {/* Figures */}
      <View style={[styles.stats, { borderColor: colors.divider }]}>
        {isAuthenticated ? (
          <>
            <Stat label="Orders" value={ordersCount} onPress={() => router.push('/orders')} />
            <Divider vertical />
          </>
        ) : null}
        <Stat label="Saved" value={wishlistCount} onPress={() => router.push('/(tabs)/wishlist')} />
        <Divider vertical />
        <Stat label="In Bag" value={cartCount} onPress={() => router.push('/(tabs)/cart')} />
      </View>

      <Group title="Shopping">
        <MenuRow icon={icon(Package)} title="My Orders" subtitle="Track and review purchases" onPress={() => router.push('/orders')} />
        <Divider />
        <MenuRow
          icon={icon(Heart)}
          title="Saved"
          subtitle={wishlistCount ? `${wishlistCount} ${wishlistCount === 1 ? 'piece' : 'pieces'}` : 'Your wishlist'}
          onPress={() => router.push('/(tabs)/wishlist')}
        />
        <Divider />
        <MenuRow icon={icon(Bell)} title="Notifications" onPress={() => router.push('/notifications')} />
      </Group>

      {isAuthenticated ? (
        <Group title="Your details">
          <MenuRow icon={icon(UserRound)} title="Edit Profile" subtitle="Name and photo" onPress={() => router.push('/account/edit-profile')} />
          <Divider />
          <MenuRow icon={icon(MapPin)} title="Saved Addresses" subtitle="For faster checkout" onPress={() => router.push('/addresses')} />
        </Group>
      ) : null}

      <Group title="The Maison">
        <MenuRow icon={icon(SettingsIcon)} title="Settings" subtitle="Appearance and notifications" onPress={() => router.push('/settings')} />
        <Divider />
        <MenuRow icon={icon(Info)} title="About Al Madina" onPress={() => router.push('/about')} />
        <Divider />
        <MenuRow icon={icon(Mail)} title="Contact Us" onPress={() => router.push('/contact')} />
      </Group>

      {isAuthenticated ? (
        <View style={[styles.signOut, { borderColor: colors.divider }]}>
          <MenuRow
            icon={<LogOut size={18} color={colors.error.base} strokeWidth={1.5} />}
            title="Sign Out"
            danger
            showChevron={false}
            onPress={confirmSignOut}
          />
        </View>
      ) : null}

      <Text variant="overline" color="muted" align="center" style={styles.version}>
        AL MADINA ITTAR · V{APP_VERSION}
      </Text>
    </ScrollView>
  );
}

function Stat({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text variant="heading" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="overline" color="muted">
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text variant="overline" color="muted">
        {title.toUpperCase()}
      </Text>
      <View style={[styles.groupBody, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Layout.screenPadding, gap: Spacing.xxl },
  flex: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: -Spacing.sm },
  name: { fontSize: 26, lineHeight: 32 },
  tier: { marginTop: Spacing.xs },
  guest: { gap: Spacing.md, marginTop: -Spacing.sm },
  guestCopy: { maxWidth: 340 },
  guestActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center' },
  statValue: { fontSize: 26, lineHeight: 30 },
  group: { gap: Spacing.sm },
  groupBody: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
  },
  signOut: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
  },
  version: { marginTop: -Spacing.sm },
});
