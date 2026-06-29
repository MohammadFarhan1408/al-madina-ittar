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
import type { ApiResponse, Product, Review } from '@/types';
import { mockLatency } from '@/utils';

export type ProductsService = {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  getByIds(ids: string[]): Promise<Product[]>;
  getFeatured(): Promise<Product[]>;
  getNewArrivals(): Promise<Product[]>;
  getBestSellers(): Promise<Product[]>;
  getSignature(): Promise<Product[]>;
  getSeasonal(): Promise<Product[]>;
  getByCategory(categoryId: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  getReviews(productId: string): Promise<Review[]>;
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

const mockService: ProductsService = {
  async getAll() {
    await mockLatency();
    return mockProducts;
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
  async getByCategory(categoryId) {
    await mockLatency();
    return mockProducts.filter((p) => p.categoryId === categoryId);
  },
  async search(query) {
    await mockLatency(200, 500);
    if (!query.trim()) return [];
    return mockProducts.filter((p) => matchesQuery(p, query));
  },
  async getReviews(productId) {
    await mockLatency();
    return mockReviews.filter((r) => r.productId === productId);
  },
};

const remoteService: ProductsService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.products);
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
  async getByCategory(categoryId) {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(
      Endpoints.productsByCategory(categoryId),
    );
    return data.data;
  },
  async search(query) {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.search, {
      params: { q: query },
    });
    return data.data;
  },
  async getReviews(productId) {
    const { data } = await apiClient.get<ApiResponse<Review[]>>(Endpoints.productReviews(productId));
    return data.data;
  },
};

export const productsService: ProductsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
