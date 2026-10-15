import { z } from 'zod';

/** Mirrors the backend: contact name 2–100, message 10–2000; newsletter is just an email. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  message: z
    .string()
    .trim()
    .min(10, 'Your message is a little short')
    .max(2000, 'Please keep your message under 2000 characters'),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const newsletterSchema = contactSchema.pick({ email: true });
