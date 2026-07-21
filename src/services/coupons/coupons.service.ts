import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type CouponPreview = {
  valid: boolean;
  discountAmount: number;
  coupon: { code: string; discountType: 'percentage' | 'fixed'; value: number };
};

export type CouponsService = {
  validate(code: string, subtotal: number): Promise<CouponPreview>;
};

const MOCK_COUPONS: Record<string, { discountType: 'percentage' | 'fixed'; value: number }> = {
  WELCOME10: { discountType: 'percentage', value: 10 },
};

const mockService: CouponsService = {
  async validate(code, subtotal) {
    await mockLatency();
    const coupon = MOCK_COUPONS[code.toUpperCase()];
    if (!coupon) throw new Error('Coupon not found');
    const raw = coupon.discountType === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
    return { valid: true, discountAmount: Math.min(raw, subtotal), coupon: { code: code.toUpperCase(), ...coupon } };
  },
};

const remoteService: CouponsService = {
  async validate(code, subtotal) {
    const { data } = await apiClient.post<ApiResponse<CouponPreview>>(Endpoints.couponValidate, { code, subtotal });
    return data.data;
  },
};

export const couponsService: CouponsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
