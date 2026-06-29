import type { ID } from './common';

export type NotificationKind = 'order' | 'promo' | 'system' | 'wishlist';

export type AppNotification = {
  id: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
};
