import { Tabs } from 'expo-router/js-tabs';

import { ArtDecoTabBar } from '@/components/navigation';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <ArtDecoTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Saved' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
