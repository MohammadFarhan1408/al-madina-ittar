/**
 * Keeps the local Zustand cart/wishlist (source of truth for guests, since checkout is
 * guest-friendly) synced with the server (source of truth once authenticated, since
 * cart/wishlist are `requireAuth` on the backend). Two entry points:
 *  - `syncGuestDataOnLogin`: one-shot merge-then-replace, called right after sign-in/up.
 *  - `startBackgroundSync`: called once at app boot; pushes subsequent local edits to
 *    the server (fire-and-forget) whenever the user is authenticated.
 */
import { cartService, productsService, wishlistService } from '@/services';
import { useCartStore, useSessionStore, useWishlistStore } from '@/store';
import type { CartItem } from '@/types';

async function reconciledToCartItems(lines: { productId: string; quantity: number; volumeMl?: number }[]) {
  if (lines.length === 0) return [] as CartItem[];
  const products = await productsService.getByIds(lines.map((l) => l.productId));
  return products
    .map((product): CartItem | null => {
      const line = lines.find((l) => l.productId === product.id);
      return line?.quantity ? { product, quantity: line.quantity, volumeMl: line.volumeMl } : null;
    })
    .filter((item): item is CartItem => item !== null);
}

const toSyncItems = (items: CartItem[]) =>
  items.map((i) => ({ productId: i.product.id, quantity: i.quantity, volumeMl: i.volumeMl }));

export async function syncGuestDataOnLogin() {
  const localIds = useWishlistStore.getState().ids;
  await Promise.allSettled(localIds.map((id) => wishlistService.add(id)));
  const serverIds = await wishlistService.getIds().catch(() => localIds);
  useWishlistStore.setState({ ids: serverIds });

  const localItems = useCartStore.getState().items;
  const payload = toSyncItems(localItems);
  const reconciled = await cartService.sync(payload).catch(() => null);
  if (!reconciled) return;
  const items = await reconciledToCartItems(reconciled.items);
  useCartStore.setState({ items });
}

let backgroundSyncStarted = false;

export function startBackgroundSync() {
  if (backgroundSyncStarted) return;
  backgroundSyncStarted = true;

  let lastSyncedIds: string[] = [];
  useWishlistStore.subscribe((state) => {
    if (!useSessionStore.getState().isAuthenticated) return;
    const added = state.ids.filter((id) => !lastSyncedIds.includes(id));
    const removed = lastSyncedIds.filter((id) => !state.ids.includes(id));
    lastSyncedIds = state.ids;
    added.forEach((id) => void wishlistService.add(id));
    removed.forEach((id) => void wishlistService.remove(id));
  });

  useCartStore.subscribe((state) => {
    if (!useSessionStore.getState().isAuthenticated) return;
    void cartService.sync(toSyncItems(state.items));
  });
}
