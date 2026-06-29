/** REST endpoint paths for the 'remote' data source. */
export const Endpoints = {
  products: '/products',
  product: (id: string) => `/products/${id}`,
  productReviews: (id: string) => `/products/${id}/reviews`,
  featuredProducts: '/products/featured',
  newArrivals: '/products/new-arrivals',
  bestSellers: '/products/best-sellers',
  signature: '/products/signature',
  seasonal: '/products/seasonal',
  search: '/products/search',
  categories: '/categories',
  productsByCategory: (categoryId: string) => `/categories/${categoryId}/products`,
  collections: '/collections',
  orders: '/orders',
  notifications: '/notifications',
} as const;
