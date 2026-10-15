import { z } from 'zod';

/** Limits mirror the backend's `shippingAddress` (min 2/5/5/2); guests must give an email. */
export const makeAddressSchema = (isGuest: boolean) =>
  z.object({
    fullName: z.string().trim().min(2, 'Please enter your name'),
    phone: z.string().trim().min(5, 'Enter a valid phone number'),
    address: z.string().trim().min(5, 'Enter your delivery address'),
    city: z.string().trim().min(2, 'Enter your city'),
    /** Guests need it to look the order up later without an account. */
    email: isGuest
      ? z.string().trim().min(1, 'Email is required for guest checkout').email('Enter a valid email')
      : z.string(),
  });

export type AddressValues = z.infer<ReturnType<typeof makeAddressSchema>>;

/** Folds a saved address into the order's single `address` line (same as the web). */
export const foldAddress = (a: {
  addressLine: string;
  landmark?: string;
  state?: string;
  postalCode?: string;
}) => [a.addressLine, a.landmark, a.state, a.postalCode].filter(Boolean).join(', ');
