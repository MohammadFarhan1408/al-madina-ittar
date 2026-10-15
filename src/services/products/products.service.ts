/**
 * Products service — typed async interface with a mock implementation (default) and a
 * remote (Axios) implementation. Swapping backends = change `AppConfig.dataSource`;
 * the rest of the app calls `productsService` unchanged.
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockProducts } from '@/services/mock/products.mock';
import { mockReviews } from '@/services/mock/reviews.mock';
import type { ApiResponse, Paginated, Product, ProductBadge, Review, ScentFamily } from '@/types';
import { mockLatency, paginate } from '@/utils';

export type ProductListParams = {
  /** Free-text filter; `/products?q=` supports family/sort together, unlike `/products/search`. */
  q?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  family?: ScentFamily;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  badge?: ProductBadge;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export type CreateReviewInput = { rating: number; title: string; body: string };

export type ProductsService = {
  getAll(params?: ProductListParams): Promise<Paginated<Product>>;
  getById(id: string): Promise<Product | undefined>;
  getByIds(ids: string[]): Promise<Product[]>;
  getFeatured(): Promise<Product[]>;
  getNewArrivals(): Promise<Product[]>;
  getBestSellers(): Promise<Product[]>;
  getSignature(): Promise<Product[]>;
  getSeasonal(): Promise<Product[]>;
  getByCategory(categoryId: string, params?: ProductListParams): Promise<Paginated<Product>>;
  search(query: string, params?: ProductListParams): Promise<Paginated<Product>>;
  suggest(query: string): Promise<string[]>;
  trending(): Promise<string[]>;
  getReviews(productId: string, page?: number, limit?: number): Promise<Paginated<Review>>;
  createReview(productId: string, input: CreateReviewInput): Promise<Review>;
};

const matchesQuery = (p: Product, q: string) => {
  const needle = q.trim().toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    p.brand.toLowerCase().includes(needle) ||
    p.scentFamily.toLowerCase().includes(needle) ||
    p.notes.some((n) => n.toLowerCase().includes(needle))
  );
};

const sortProducts = (list: Product[], sort?: ProductListParams['sort']) => {
  switch (sort) {
    case 'price_asc':
      return [...list].sort((a, b) => a.price - b.price);
    case 'price_desc':
      return [...list].sort((a, b) => b.price - a.price);
    case 'rating':
      return [...list].sort((a, b) => b.rating - a.rating);
    default:
      return list;
  }
};

const filterProducts = (list: Product[], params?: ProductListParams) => {
  let result = list;
  if (params?.q?.trim()) result = result.filter((p) => matchesQuery(p, params.q!));
  if (params?.categoryId) result = result.filter((p) => p.categoryId === params.categoryId);
  if (params?.family) result = result.filter((p) => p.scentFamily === params.family);
  if (params?.badge) result = result.filter((p) => p.badge === params.badge);
  if (params?.inStock !== undefined) result = result.filter((p) => p.inStock === params.inStock);
  if (params?.minPrice !== undefined) result = result.filter((p) => p.price >= params.minPrice!);
  if (params?.maxPrice !== undefined) result = result.filter((p) => p.price <= params.maxPrice!);
  return sortProducts(result, params?.sort);
};

const mockService: ProductsService = {
  async getAll(params) {
    await mockLatency();
    return paginate(filterProducts(mockProducts, params), params?.page, params?.limit);
  },
  async getById(id) {
    await mockLatency();
    return mockProducts.find((p) => p.id === id);
  },
  async getByIds(ids) {
    await mockLatency();
    return mockProducts.filter((p) => ids.includes(p.id));
  },
  async getFeatured() {
    await mockLatency();
    return mockProducts.filter((p) => p.isFeatured);
  },
  async getNewArrivals() {
    await mockLatency();
    return mockProducts.filter((p) => p.isNewArrival);
  },
  async getBestSellers() {
    await mockLatency();
    return mockProducts.filter((p) => p.isBestSeller);
  },
  async getSignature() {
    await mockLatency();
    return mockProducts.filter((p) => p.isSignature);
  },
  async getSeasonal() {
    await mockLatency();
    return mockProducts.filter((p) => p.isSeasonal);
  },
  async getByCategory(categoryId, params) {
    await mockLatency();
    return paginate(
      filterProducts(mockProducts, { ...params, categoryId }),
      params?.page,
      params?.limit,
    );
  },
  async search(query, params) {
    await mockLatency(200, 500);
    if (!query.trim()) return paginate([], params?.page, params?.limit);
    return paginate(
      filterProducts(mockProducts.filter((p) => matchesQuery(p, query)), params),
      params?.page,
      params?.limit,
    );
  },
  async suggest(query) {
    await mockLatency(100, 250);
    const needle = query.trim().toLowerCase();
    return mockProducts
      .filter((p) => p.name.toLowerCase().startsWith(needle))
      .slice(0, 6)
      .map((p) => p.name);
  },
  async trending() {
    await mockLatency();
    return ['Oud', 'Rose', 'Amber', 'Saffron', 'Musk'];
  },
  async getReviews(productId, page, limit) {
    await mockLatency();
    return paginate(mockReviews.filter((r) => r.productId === productId), page, limit);
  },
  async createReview(productId, input) {
    await mockLatency();
    const review: Review = {
      id: `r-${Date.now()}`,
      productId,
      author: 'You',
      rating: input.rating,
      title: input.title,
      body: input.body,
      date: new Date().toISOString().slice(0, 10),
      verified: false,
    };
    mockReviews.unshift(review);
    return review;
  },
};

const listParamsToQuery = (params?: ProductListParams) => ({
  q: params?.q,
  page: params?.page,
  limit: params?.limit,
  categoryId: params?.categoryId,
  family: params?.family,
  sort: params?.sort,
  badge: params?.badge,
  inStock: params?.inStock,
  minPrice: params?.minPrice,
  maxPrice: params?.maxPrice,
});

const remoteService: ProductsService = {
  async getAll(params) {
    const { data } = await apiClient.get<ApiResponse<Paginated<Product>>>(Endpoints.products, {
      params: listParamsToQuery(params),
    });
    return data.data;
  },
  async getById(id) {
    const { data } = await apiClient.get<ApiResponse<Product>>(Endpoints.product(id));
    return data.data;
  },
  async getByIds(ids) {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.products, {
      params: { ids: ids.join(',') },
    });
    return data.data;
  },
  async getFeatured() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.featuredProducts);
    return data.data;
  },
  async getNewArrivals() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.newArrivals);
    return data.data;
  },
  async getBestSellers() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.bestSellers);
    return data.data;
  },
  async getSignature() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.signature);
    return data.data;
  },
  async getSeasonal() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.seasonal);
    return data.data;
  },
  async getByCategory(categoryId, params) {
    const { data } = await apiClient.get<ApiResponse<Paginated<Product>>>(
      Endpoints.productsByCategory(categoryId),
      { params: { page: params?.page, limit: params?.limit } },
    );
    return data.data;
  },
  async search(query, params) {
    const { data } = await apiClient.get<ApiResponse<Paginated<Product>>>(Endpoints.search, {
      params: { ...listParamsToQuery(params), q: query },
    });
    return data.data;
  },
  async suggest(query) {
    const { data } = await apiClient.get<ApiResponse<string[]>>(Endpoints.suggest, {
      params: { q: query, limit: 6 },
    });
    return data.data;
  },
  async trending() {
    const { data } = await apiClient.get<ApiResponse<string[]>>(Endpoints.trending);
    return data.data;
  },
  async getReviews(productId, page, limit) {
    const { data } = await apiClient.get<ApiResponse<Paginated<Review>>>(
      Endpoints.productReviews(productId),
      { params: { page, limit } },
    );
    return data.data;
  },
  async createReview(productId, input) {
    const { data } = await apiClient.post<ApiResponse<Review>>(
      Endpoints.productReviews(productId),
      input,
    );
    return data.data;
  },
};

export const productsService: ProductsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
