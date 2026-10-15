import { statusDates } from './timeline';

describe('statusDates', () => {
  it('starts at placedAt and lets statusHistory override', () => {
    const dates = statusDates({
      placedAt: '2026-10-01T08:00:00Z',
      statusHistory: [
        { status: 'processing', at: '2026-10-01T08:00:01Z' },
        { status: 'shipped', at: '2026-10-02T09:00:00Z' },
      ],
    });
    expect(dates.processing).toBe('2026-10-01T08:00:01Z');
    expect(dates.shipped).toBe('2026-10-02T09:00:00Z');
    expect(dates.delivered).toBeUndefined();
  });
  it('works without history', () => {
    expect(statusDates({ placedAt: 'x' })).toEqual({ processing: 'x' });
  });
});
