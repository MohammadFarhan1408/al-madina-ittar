import { editProfileSchema } from '../profile/schema';
import { addressFormSchema, emptyAddressForm } from './schema';

describe('account schemas', () => {
  it('address needs the backend minimums only', () => {
    const ok = { ...emptyAddressForm('Aisha K'), phone: '05012', addressLine: 'Villa', city: 'D' };
    expect(addressFormSchema.safeParse(ok).success).toBe(true);
    expect(addressFormSchema.safeParse({ ...ok, phone: '123' }).success).toBe(false);
    expect(addressFormSchema.safeParse({ ...ok, country: '' }).success).toBe(false);
  });
  it('profile name 2-100 and avatar must be a URL when set', () => {
    expect(editProfileSchema.safeParse({ fullName: 'A', avatar: '' }).success).toBe(false);
    expect(editProfileSchema.safeParse({ fullName: 'x'.repeat(101), avatar: '' }).success).toBe(false);
    expect(editProfileSchema.safeParse({ fullName: 'Aisha K', avatar: 'nope' }).success).toBe(false);
    expect(editProfileSchema.safeParse({ fullName: 'Aisha K', avatar: 'https://x.co/a.png' }).success).toBe(true);
    expect(editProfileSchema.safeParse({ fullName: 'Aisha K', avatar: '' }).success).toBe(true);
  });
});
