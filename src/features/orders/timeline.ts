/** Order fulfilment timeline helpers (mirrors the web's `features/order/timeline.ts`). */
import type { Order, OrderStatus } from '@/types';

export const TIMELINE_STEPS: Exclude<OrderStatus, 'cancelled'>[] = ['processing', 'shipped', 'delivered'];

/** ISO date per status: `processing` starts at `placedAt`; `statusHistory` entries win. */
export const statusDates = (
  order: Pick<Order, 'placedAt' | 'statusHistory'>,
): Partial<Record<OrderStatus, string>> => {
  const dates: Partial<Record<OrderStatus, string>> = { processing: order.placedAt };
  for (const entry of order.statusHistory ?? []) dates[entry.status] = entry.at;
  return dates;
};
