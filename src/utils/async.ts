/** Small async helpers. */

/** Resolve after `ms` — used by mock services to make loading states real. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Random latency within a range, for realistic mock network timing. */
export const mockLatency = (min = 350, max = 800): Promise<void> =>
  delay(Math.floor(min + Math.random() * (max - min)));

/** Slices a full array into a backend-shaped `Paginated<T>` page for mock services. */
export const paginate = <T>(all: T[], page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);
  return {
    items,
    page,
    pageSize: limit,
    total: all.length,
    hasMore: start + items.length < all.length,
  };
};
