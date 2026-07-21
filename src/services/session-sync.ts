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

async function reconciledToCartItems(productIds: string[], quantityById: Map<string, number>) {
  if (productIds.length === 0) return [] as CartItem[];
  const products = await productsService.getByIds(productIds);
  return products
    .map((product) => {
      const quantity = quantityById.get(product.id);
      return quantity ? { product, quantity } : null;
    })
    .filter((item): item is CartItem => item !== null);
}

export async function syncGuestDataOnLogin() {
  const localIds = useWishlistStore.getState().ids;
  await Promise.allSettled(localIds.map((id) => wishlistService.add(id)));
  const serverIds = await wishlistService.getIds().catch(() => localIds);
  useWishlistStore.setState({ ids: serverIds });

  const localItems = useCartStore.getState().items;
  const payload = localItems.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
  const reconciled = await cartService.sync(payload).catch(() => null);
  if (!reconciled) return;
  const quantityById = new Map(reconciled.items.map((i) => [i.productId, i.quantity]));
  const items = await reconciledToCartItems(
    reconciled.items.map((i) => i.productId),
    quantityById,
  );
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
    void cartService.sync(state.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
  });
}
