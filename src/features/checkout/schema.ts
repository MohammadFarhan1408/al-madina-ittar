import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your street address'),
  city: z.string().min(2, 'Enter your city'),
  /** Only required for guest checkout — used to look up the order without an account. */
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
});

export type AddressValues = z.infer<typeof addressSchema>;
