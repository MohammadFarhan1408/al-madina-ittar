import { contactSchema, newsletterSchema } from './schemas';

const ok = { name: 'Aisha', email: 'a@b.co', message: 'Hello there, a question.' };

describe('contact schemas', () => {
  it('enforces backend limits', () => {
    expect(contactSchema.safeParse(ok).success).toBe(true);
    expect(contactSchema.safeParse({ ...ok, name: 'A' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: 'short' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: 'x'.repeat(2001) }).success).toBe(false);
  });
  it('newsletter needs a valid email', () => {
    expect(newsletterSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
  });
});
