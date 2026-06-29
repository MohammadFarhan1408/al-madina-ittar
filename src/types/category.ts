import type { ID } from './common';

export type Category = {
  id: ID;
  name: string;
  /** Short tagline shown under the name on category cards. */
  tagline?: string;
  /** Remote or bundled image used as the card backdrop. */
  image: string;
  productCount: number;
};
