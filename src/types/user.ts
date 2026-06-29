import type { ID } from './common';

export type User = {
  id: ID;
  fullName: string;
  email: string;
  avatar?: string;
  memberSince: string;
  /** Loyalty tier for the premium experience. */
  tier: 'Guest' | 'Member' | 'Connoisseur' | 'Maison Elite';
};
