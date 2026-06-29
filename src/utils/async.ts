/** Small async helpers. */

/** Resolve after `ms` — used by mock services to make loading states real. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Random latency within a range, for realistic mock network timing. */
export const mockLatency = (min = 350, max = 800): Promise<void> =>
  delay(Math.floor(min + Math.random() * (max - min)));
