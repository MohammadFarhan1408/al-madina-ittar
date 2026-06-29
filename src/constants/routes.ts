/**
 * Centralized route paths. Expo Router uses file paths, but referencing them through
 * these helpers keeps navigation calls consistent and refactor-safe.
 */
export const Routes = {
  // Gate / onboarding / auth
  splash: '/',
  onboarding: '/onboarding',
  login: '/(auth)/login',
  register: '/(auth)/register',

  // Tabs
  home: '/(tabs)',
  shop: '/(tabs)/shop',
  cart: '/(tabs)/cart',
  wishlist: '/(tabs)/wishlist',
  profile: '/(tabs)/profile',

  // Stack screens
  productDetails: (id: string) => `/product/${id}`,
  products: '/products',
  productsByCategory: (categoryId: string) => `/products?categoryId=${categoryId}`,
  search: '/search',
  checkout: '/checkout',
  orders: '/orders',
  notifications: '/notifications',
  settings: '/settings',
  about: '/about',
  contact: '/contact',
} as const;
