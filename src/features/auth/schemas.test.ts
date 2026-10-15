import { loginSchema, passwordSchema, registerSchema } from './schemas';

describe('auth schemas', () => {
  it('enforces the backend password policy', () => {
    expect(passwordSchema.safeParse('short1').success).toBe(false);
    expect(passwordSchema.safeParse('allletters').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
    expect(passwordSchema.safeParse('a'.repeat(129) + '1').success).toBe(false);
    expect(passwordSchema.safeParse('goodpass1').success).toBe(true);
  });
  it('limits full name to 2-100 chars', () => {
    const base = { email: 'a@b.co', password: 'goodpass1' };
    expect(registerSchema.safeParse({ ...base, fullName: 'A' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, fullName: 'x'.repeat(101) }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, fullName: 'Aisha K' }).success).toBe(true);
  });
  it('login accepts legacy short passwords', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
});
