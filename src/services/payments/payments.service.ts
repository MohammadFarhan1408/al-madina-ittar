import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse, Transaction } from '@/types';
import { mockLatency } from '@/utils';

export type PaymentsService = {
  getForOrder(orderId: string): Promise<Transaction[]>;
  retry(orderId: string, idempotencyKey: string): Promise<Transaction>;
};

// Mock in-memory transactions, keyed by orderId, so a retry after a mock
// failure is reflected on subsequent reads within the session.
const mockTransactions: Record<string, Transaction[]> = {};

function mockTransactionFor(orderId: string, provider: 'cod' | 'simulated'): Transaction {
  return {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    provider,
    status: provider === 'cod' ? 'pending' : 'processing',
    amount: 0,
    currency: AppConfig.defaultCurrency,
    providerReference: provider === 'simulated' ? `sim-${Date.now()}` : undefined,
    createdAt: new Date().toISOString(),
  };
}

const mockService: PaymentsService = {
  async getForOrder(orderId) {
    await mockLatency();
    if (!mockTransactions[orderId]) {
      mockTransactions[orderId] = [mockTransactionFor(orderId, 'simulated')];
      // Simulate the gateway settling shortly after order placement.
      setTimeout(() => {
        const list = mockTransactions[orderId];
        if (list?.[0]?.status === 'processing') list[0] = { ...list[0], status: 'succeeded' };
      }, 2500);
    }
    return mockTransactions[orderId];
  },
  async retry(orderId, idempotencyKey) {
    await mockLatency();
    const transaction: Transaction = { ...mockTransactionFor(orderId, 'simulated'), id: `txn-${idempotencyKey}` };
    mockTransactions[orderId] = [transaction, ...(mockTransactions[orderId] ?? [])];
    setTimeout(() => {
      const list = mockTransactions[orderId];
      if (list?.[0]?.status === 'processing') list[0] = { ...list[0], status: 'succeeded' };
    }, 2000);
    return transaction;
  },
};

const remoteService: PaymentsService = {
  async getForOrder(orderId) {
    const { data } = await apiClient.get<ApiResponse<Transaction[]>>(Endpoints.orderPayments(orderId));
    return data.data;
  },
  async retry(orderId, idempotencyKey) {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(Endpoints.orderPaymentRetry(orderId), {
      idempotencyKey,
    });
    return data.data;
  },
};

export const paymentsService: PaymentsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
