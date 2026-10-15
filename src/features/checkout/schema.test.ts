import { foldAddress, makeAddressSchema } from './schema';

const base = { fullName: 'Aisha K', phone: '0501234', address: 'Villa 4, Al Wasl', city: 'Dubai' };

describe('checkout schema', () => {
  it('requires a valid email only for guests', () => {
    expect(makeAddressSchema(true).safeParse({ ...base, email: '' }).success).toBe(false);
    expect(makeAddressSchema(true).safeParse({ ...base, email: 'a@b.co' }).success).toBe(true);
    expect(makeAddressSchema(false).safeParse({ ...base, email: '' }).success).toBe(true);
  });
  it('folds a saved address, skipping empty parts', () => {
    expect(foldAddress({ addressLine: 'Villa 4', state: 'Dubai', postalCode: '' })).toBe('Villa 4, Dubai');
  });
});
