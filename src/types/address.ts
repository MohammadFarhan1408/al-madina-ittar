import type { ID } from './common';

/** Saved address book entry — richer than the `ShippingAddress` snapshot embedded in
 * an `Order` (which only keeps fullName/phone/address/city at purchase time). */
export type Address = {
  id: ID;
  label?: string;
  fullName: string;
  phone: string;
  addressLine: string;
  country: string;
  state?: string;
  city: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, 'id'>;
