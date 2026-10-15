/**
 * ProfileScreen (tab) — session-aware account hub. Shows the signed-in member (or a
 * sign-in CTA), loyalty stats, and menu rows linking to every account screen.
 */
import { router } from "expo-router";
import {
  Bell,
  Heart,
  Info,
  LogOut,
  Mail,
  MapPin,
  Package,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArtDecoDivider, GradientBackdrop } from "@/components/brand";
import { Avatar, Button, Card, Divider, MenuRow, Text } from "@/components/ui";
import { IconSize, Layout, Spacing } from "@/constants";
import { Palette } from "@/constants/colors";
import { useTheme } from "@/core/theme";
import { useOrders } from "@/hooks/queries";
import {
  selectCartCount,
  selectWishlistCount,
  toast,
  useCartStore,
  useSessionStore,
  useWishlistStore,
} from "@/store";

export function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, signOut } = useSessionStore();
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const cartCount = useCartStore(selectCartCount);
  const { data: ordersPage } = useOrders();
  const ordersCount = ordersPage?.total ?? 0;

  const icon = (Ic: typeof Package) => (
    <Ic size={IconSize.sm} color={colors.accent} strokeWidth={1.75} />
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Layout.tabBarClearance }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xxl }]}>
        <GradientBackdrop variant="hero" pattern patternOpacity={0.06} />
        <Avatar uri={user?.avatar} name={user?.fullName ?? "Guest"} size="xl" />
        <Text
          variant="display"
          colorValue={Palette.ivory}
          align="center"
          style={styles.name}
        >
          {isAuthenticated ? user?.fullName : "Welcome"}
        </Text>
        {isAuthenticated ? (
          <View style={[styles.tier, { borderColor: Palette.champagne }]}>
            <Text variant="label" colorValue={Palette.champagne} uppercase>
              {user?.tier} Member
            </Text>
          </View>
        ) : (
          <Text
            variant="body"
            colorValue={Palette.ivoryDim}
            align="center"
            style={styles.guestCopy}
          >
            Sign in to track orders and save your favourites.
          </Text>
        )}
        {!isAuthenticated ? (
          <Button
            label="Sign In / Register"
            variant="gradient"
            glow
            fullWidth={false}
            onPress={() => router.push("/(auth)/login")}
            style={styles.signIn}
          />
        ) : null}
      </View>

      <View style={styles.body}>
        {/* Stats */}
        <Card variant="glass">
          <View style={styles.stats}>
            <Stat label="Orders" value={String(ordersCount)} />
            <Divider vertical />
            <Stat label="Wishlist" value={String(wishlistCount)} />
            <Divider vertical />
            <Stat label="Cart" value={String(cartCount)} />
          </View>
        </Card>

        <ArtDecoDivider label="ACCOUNT" style={styles.divider} />

        <Card padded={false} style={styles.menu}>
          <View style={styles.menuInner}>
            <MenuRow
              icon={icon(Package)}
              title="My Orders"
              subtitle="Track & review purchases"
              onPress={() => router.push("/orders")}
            />
            <Divider />
            {isAuthenticated ? (
              <>
                <MenuRow
                  icon={icon(UserRound)}
                  title="Edit Profile"
                  subtitle="Name and photo"
                  onPress={() => router.push("/account/edit-profile")}
                />
                <Divider />
                <MenuRow
                  icon={icon(MapPin)}
                  title="Saved Addresses"
                  subtitle="Delivery addresses"
                  onPress={() => router.push("/addresses")}
                />
                <Divider />
              </>
            ) : null}
            <MenuRow
              icon={icon(Heart)}
              title="Wishlist"
              subtitle={`${wishlistCount} saved`}
              onPress={() => router.push("/(tabs)/wishlist")}
            />
            <Divider />
            <MenuRow
              icon={icon(Bell)}
              title="Notifications"
              onPress={() => router.push("/notifications")}
            />
          </View>
        </Card>

        <ArtDecoDivider label="MORE" style={styles.divider} />

        <Card padded={false} style={styles.menu}>
          <View style={styles.menuInner}>
            <MenuRow
              icon={icon(SettingsIcon)}
              title="Settings"
              onPress={() => router.push("/settings")}
            />
            <Divider />
            <MenuRow
              icon={icon(Info)}
              title="About Al Madina"
              onPress={() => router.push("/about")}
            />
            <Divider />
            <MenuRow
              icon={icon(Mail)}
              title="Contact Us"
              onPress={() => router.push("/contact")}
            />
          </View>
        </Card>

        {isAuthenticated ? (
          <MenuRow
            icon={
              <LogOut
                size={IconSize.sm}
                color={colors.error.base}
                strokeWidth={1.75}
              />
            }
            title="Sign Out"
            danger
            showChevron={false}
            onPress={() => {
              signOut();
              toast.info("You have been signed out");
            }}
          />
        ) : null}

        <Text
          variant="caption"
          color="muted"
          align="center"
          style={styles.version}
        >
          Al Madina · v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title" color="accent">
        {value}
      </Text>
      <Text variant="label" color="secondary" uppercase>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { letterSpacing: 1 },
  tier: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  guestCopy: { maxWidth: 280 },
  signIn: { alignSelf: "center", marginTop: Spacing.sm, paddingHorizontal: Spacing.xl },
  body: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  divider: { alignSelf: "center", marginTop: Spacing.sm },
  menu: { overflow: "hidden" },
  menuInner: { paddingHorizontal: Spacing.lg },
  version: { marginTop: Spacing.lg },
});
