import type { ID } from './common';

export type Review = {
  id: ID;
  productId: ID;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};
