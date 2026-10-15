# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Backend integration rules (permanent)

This app is wired to the real `al-madina-api` backend
(`EXPO_PUBLIC_DATA_SOURCE=remote` in `.env`). Every domain service still keeps
a `mock` half — don't remove it, and don't add a `remote` method without a
matching `mock` one (or vice versa); the pair must stay complete even when the
mock implementation is trivial, since flipping `dataSource` back to `mock`
must keep working for backend-less UI dev.

- **Don't add mobile UI for an endpoint that doesn't exist.** Check
  `../docs/api-reference.md` and the actual backend route inventory
  (`al-madina-api/src/modules/*/*.routes.ts`) before building a screen or
  action against a feature — recently-viewed was explicitly descoped this way
  (see `../docs/mobile-flow.md` §6); don't resurrect it speculatively. Also
  not buildable (no backend support): customer order cancel, change password,
  delete account, OTP/email verification, avatar upload, newsletter
  unsubscribe, real push delivery.
- **When a field is added to `Order`/`Product`/`User` on the backend, check
  both `al-madina-admin` and this app for the same field.** The mobile
  `types/` (e.g. `types/order.ts`, `types/product.ts`) intentionally mirror
  the backend's actual response shape (line-item snapshots, not full
  `Product` refs, for orders) — don't reshape them back to something more
  convenient for one screen without checking every consumer.
- **Auth tokens live in `expo-secure-store`, never in AsyncStorage or in a
  Zustand `persist` blob.** `session.store.ts`'s persisted slice is
  `{user, isAuthenticated}` only — if you need to read/write a token, go
  through `src/services/api/token-storage.ts`.
- **Cart/wishlist are guest-first, server-mirrored once authenticated** — see
  `src/services/session-sync.ts`. Don't wire individual add/remove/toggle
  buttons directly to the cart/wishlist API; they should keep going through
  the Zustand stores, which `session-sync.ts`'s background subscription
  syncs to the server. Adding a second, independent sync path there is how
  you get the local store and the server disagreeing.
- **Variants and coupons are wired.** Product Details sizes come from
  `product.variants`; `volumeMl` travels through the cart store, cart sync and
  `POST /orders`, and the backend re-prices (`resolveLinePricing`). The
  backend cart holds ONE line per product, so adding a different size
  *replaces* the line (`addItem` returns `'replaced'`) — don't try to keep two
  sizes of one product. Coupons: the code lives in the cart store
  (`couponCode`), is validated via `POST /coupons/validate`, re-validated on
  subtotal change (`useAppliedCoupon`), and sent on the order only when valid.
- **Card/wallet payments go through Stripe Checkout in the in-app browser**
  (`services/payments/checkout-browser.ts`). The backend hard-codes Stripe's
  return URL to the web storefront, so the app can't auto-return; it refetches
  the order when the browser closes and polls for 2 minutes. Guests must pass
  their email (`?email=`) when reading their own order/payments.
- **The Cart screen's total is not the final checkout total** (no express
  surcharge until `deliveryMethod` is chosen at checkout) — don't "fix" this
  by computing the surcharge client-side in the cart; the checkout screen is
  where the authoritative total is shown.
- Workspace-level docs (`../docs/*.md`) can lag the live source — treat this
  repo's code as ground truth and update the relevant doc when you notice
  drift, rather than assuming the doc is current.
