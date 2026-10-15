import { z } from 'zod';

/** Mirrors the backend address schema (`addresses.schema.ts`): only these minimums apply. */
export const addressFormSchema = z.object({
  label: z.string().trim(),
  fullName: z.string().trim().min(2, 'Please enter a name'),
  phone: z.string().trim().min(5, 'Enter a valid phone number'),
  addressLine: z.string().trim().min(3, 'Enter the street address'),
  country: z.string().trim().min(2, 'Enter a country'),
  state: z.string().trim(),
  city: z.string().trim().min(1, 'Enter a city'),
  postalCode: z.string().trim(),
  landmark: z.string().trim(),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const emptyAddressForm = (fullName = ''): AddressFormValues => ({
  label: '',
  fullName,
  phone: '',
  addressLine: '',
  country: 'United Arab Emirates',
  state: '',
  city: '',
  postalCode: '',
  landmark: '',
  isDefault: false,
});
