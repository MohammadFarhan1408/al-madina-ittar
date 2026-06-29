import type { ID } from './common';

/** A curated/seasonal collection surfaced on Home. */
export type Collection = {
  id: ID;
  title: string;
  subtitle: string;
  image: string;
  /** Accent gradient key hint for theming the card. */
  accent: 'gold' | 'emerald' | 'burgundy';
  productCount: number;
};
