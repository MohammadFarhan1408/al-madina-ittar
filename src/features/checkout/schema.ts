import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your street address'),
  city: z.string().min(2, 'Enter your city'),
});

export type AddressValues = z.infer<typeof addressSchema>;
