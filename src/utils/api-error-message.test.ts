import { getErrorMessage } from './api-error-message';

const err = (status: number, message: string, code?: string) => ({ status, message, code });

describe('getErrorMessage', () => {
  it('uses fallback for non-API errors', () => {
    expect(getErrorMessage(new Error('x'), 'fb')).toBe('fb');
  });
  it('maps network failure', () => {
    expect(getErrorMessage(err(0, 'Network Error'), 'fb')).toMatch(/No connection/);
  });
  it('keeps backend lockout message', () => {
    expect(getErrorMessage(err(429, 'Try again in 15 minutes.', 'ACCOUNT_LOCKED'), 'fb')).toBe(
      'Try again in 15 minutes.',
    );
  });
  it('maps inactive account', () => {
    expect(getErrorMessage(err(403, 'Account is deactivated', 'ACCOUNT_INACTIVE'), 'fb')).toMatch(
      /deactivated/,
    );
  });
  it('hides 5xx detail behind fallback, shows 4xx message', () => {
    expect(getErrorMessage(err(500, 'boom'), 'fb')).toBe('fb');
    expect(getErrorMessage(err(409, 'Out of stock', 'PRODUCT_OUT_OF_STOCK'), 'fb')).toBe('Out of stock');
  });
});
