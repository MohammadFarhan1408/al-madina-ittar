/**
 * Auth service — typed async interface with a mock implementation (default, fake
 * synthesis, no backend) and a remote (Axios) implementation against the real API.
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse, AuthTokens, User, UserPreferences } from '@/types';
import { mockLatency } from '@/utils';

export type AuthResult = { user: User; tokens: AuthTokens };

/** Wire shape returned by the backend for sign-up/sign-in (flat, not nested). */
type AuthWireResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt?: string;
};
const fromWire = (wire: AuthWireResult): AuthResult => ({
  user: wire.user,
  tokens: {
    accessToken: wire.accessToken,
    refreshToken: wire.refreshToken,
    refreshExpiresAt: wire.refreshExpiresAt,
  },
});

export type AuthService = {
  signUp(fullName: string, email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(refreshToken: string): Promise<void>;
  me(): Promise<User>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  updateProfile(input: { fullName?: string; avatar?: string }): Promise<User>;
  getPreferences(): Promise<UserPreferences>;
  updatePreferences(input: Partial<UserPreferences>): Promise<UserPreferences>;
};

const nameFromEmail = (email: string) => {
  const handle = email.split('@')[0] ?? 'Guest';
  return handle
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const makeUser = (fullName: string, email: string): User => ({
  id: `u-${Date.now()}`,
  fullName,
  email,
  memberSince: new Date().toISOString().slice(0, 10),
  tier: 'Member',
  role: 'user',
});

let mockCurrentUser: User | null = null;
let mockPreferences: UserPreferences = {
  themeMode: 'system',
  promosEnabled: true,
  orderUpdatesEnabled: true,
  currency: 'AED',
  language: 'en',
};

const mockService: AuthService = {
  async signUp(fullName, email) {
    await mockLatency();
    const user = makeUser(fullName, email);
    mockCurrentUser = user;
    return { user, tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' } };
  },
  async signIn(email) {
    await mockLatency();
    const user = makeUser(nameFromEmail(email), email);
    mockCurrentUser = user;
    return { user, tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' } };
  },
  async signOut() {
    await mockLatency();
    mockCurrentUser = null;
  },
  async me() {
    await mockLatency();
    if (!mockCurrentUser) throw new Error('Not signed in');
    return mockCurrentUser;
  },
  async forgotPassword() {
    await mockLatency();
  },
  async resetPassword() {
    await mockLatency();
  },
  async updateProfile(input) {
    await mockLatency();
    if (!mockCurrentUser) throw new Error('Not signed in');
    mockCurrentUser = { ...mockCurrentUser, ...input };
    return mockCurrentUser;
  },
  async getPreferences() {
    await mockLatency();
    return { ...mockPreferences };
  },
  async updatePreferences(input) {
    await mockLatency();
    mockPreferences = { ...mockPreferences, ...input };
    return { ...mockPreferences };
  },
};

const remoteService: AuthService = {
  async signUp(fullName, email, password) {
    const { data } = await apiClient.post<ApiResponse<AuthWireResult>>(Endpoints.auth.signUp, {
      fullName,
      email,
      password,
    });
    return fromWire(data.data);
  },
  async signIn(email, password) {
    const { data } = await apiClient.post<ApiResponse<AuthWireResult>>(Endpoints.auth.signIn, {
      email,
      password,
    });
    return fromWire(data.data);
  },
  async signOut(refreshToken) {
    await apiClient.post<ApiResponse<null>>(Endpoints.auth.signOut, { refreshToken });
  },
  async me() {
    const { data } = await apiClient.get<ApiResponse<User>>(Endpoints.auth.me);
    return data.data;
  },
  async forgotPassword(email) {
    await apiClient.post<ApiResponse<null>>(Endpoints.auth.forgotPassword, { email });
  },
  async resetPassword(token, password) {
    await apiClient.post<ApiResponse<null>>(Endpoints.auth.resetPassword, { token, password });
  },
  async updateProfile(input) {
    const { data } = await apiClient.patch<ApiResponse<User>>(Endpoints.users.me, input);
    return data.data;
  },
  async getPreferences() {
    const { data } = await apiClient.get<ApiResponse<UserPreferences>>(Endpoints.users.preferences);
    return data.data;
  },
  async updatePreferences(input) {
    const { data } = await apiClient.patch<ApiResponse<UserPreferences>>(
      Endpoints.users.preferences,
      input,
    );
    return data.data;
  },
};

export const authService: AuthService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
