# Al Madina — Backend Technical Specification

## Production-Ready Node.js Backend Blueprint

## 1. Project Overview

### Purpose

Al Madina is a luxury Arabian perfume (Ittar) eCommerce mobile application. The backend serves as the API layer powering a React Native Expo app with full commerce capabilities.

### Main Features

- Product catalogue (Ittars, with scent families, volumes, badges)
- Curated collections and categories
- Search with filters and sorting
- Wishlist management (per-user, synced)
- Cart (currently client-side; sync endpoint optional for multi-device)
- 4-step checkout (address → delivery → payment → review)
- Order management and history
- User authentication (email/password + guest checkout)
- Loyalty tiers (Member, Connoisseur, Maison Elite)
- Push notifications (order updates, promos, stock alerts)
- In-app notifications (read/unread tracking)
- Reviews and ratings
- Admin dashboard (products, orders, customers, promos)

### Business Goals

- Sell luxury Arabian fragrances to Gulf + international customers
- Default currency: AED; free shipping threshold: 250 AED; flat shipping fee: 20 AED
- Loyalty program with tier upgrades
- Guest checkout with optional account creation post-purchase

### Target Users

- Mobile-first (React Native iOS + Android)
- Admin users (web dashboard or secured API endpoints)

### Architecture Summary

Layer + Feature Based. REST API. PostgreSQL + Prisma ORM. Redis caching. JWT auth with refresh tokens. Cloudinary for media. BullMQ for background jobs. Socket.IO for real-time order status (optional Phase 2).

---

## 2. Complete Frontend Folder Structure

```
src/
├── app/                         # Expo Router (file-based routes)
│   ├── _layout.tsx              # Root stack + font loading + splash
│   ├── index.tsx                # Splash gate → onboarding or tabs
│   ├── onboarding.tsx           # 3-slide first-launch carousel
│   ├── +not-found.tsx           # 404 fallback
│   ├── (auth)/                  # Modal auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                  # Bottom tab navigation
│   │   ├── _layout.tsx          # ArtDecoTabBar (5 tabs)
│   │   ├── index.tsx            # Home
│   │   ├── shop.tsx             # Categories
│   │   ├── wishlist.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   ├── product/[id].tsx         # Product Details (dynamic)
│   ├── products.tsx             # Product Listing (?categoryId, ?query)
│   ├── search.tsx               # Search modal
│   ├── checkout.tsx             # Multi-step checkout
│   ├── orders.tsx               # Order history
│   ├── notifications.tsx        # In-app notifications
│   ├── settings.tsx             # Theme, notifications, region
│   ├── about.tsx                # Brand story
│   └── contact.tsx              # Contact form
├── features/                    # Feature modules (screens + components)
│   ├── splash/
│   ├── onboarding/
│   ├── auth/screens/ + components/ + schemas.ts
│   ├── home/screens/ + components/
│   ├── shop/
│   ├── listing/
│   ├── details/
│   ├── search/
│   ├── cart/ + components/CartLineItem
│   ├── wishlist/
│   ├── checkout/ + components/ + schema.ts
│   └── account/ (orders, notifications, settings, about, contact, profile)
├── components/
│   ├── brand/    # Logo, ArtDecoFrame, GradientBackdrop, FloatingMotif, etc.
│   ├── commerce/ # ProductCard, CategoryTile, CollectionCard, OrderCard, etc.
│   ├── ui/       # Button, Card, Input, Text, Badge, GlassSurface, etc.
│   ├── layout/   # Screen, Section, StackHeader
│   ├── product/  # WishlistButton
│   └── navigation/ # ArtDecoTabBar
├── store/        # Zustand stores (cart, wishlist, session, ui, search)
├── services/     # API client + service modules (products, orders, etc.)
├── hooks/        # React Query hooks + custom hooks
├── types/        # TypeScript interfaces (product, category, order, etc.)
├── constants/    # Design tokens (colors, spacing, typography, routes, etc.)
├── theme/        # Dark/light semantic color themes
├── core/         # Theme provider, platform utils, app config
├── animations/   # Reanimated hooks and presets
└── utils/        # format, haptics, async, zod-resolver
```

---

## 3. Feature Documentation

### Authentication

- **Purpose:** Email/password login and registration; guest checkout; session persistence
- **UI:** Glass card over gradient backdrop; RHF + Zod validation; social buttons (visual only)
- **Business Logic:** No social auth in v1. JWT access + refresh tokens. Guest can checkout; optionally create account post-purchase.
- **Backend APIs:** POST /auth/sign-up, POST /auth/sign-in, POST /auth/sign-out, GET /auth/me, POST /auth/refresh, POST /auth/forgot-password, POST /auth/reset-password
- **Database Tables:** users, refresh_tokens

### Home

- **Purpose:** Discovery landing — showcases brand + curated product sections
- **UI:** Scroll-parallax hero; horizontal rails (Signature, Best Sellers, New Arrivals, Seasonal); Categories rail; Collections rail; Offer Banner; Reviews carousel; Brand Story
- **Business Logic:** Multiple filtered product queries; no user-specific data except wishlist state overlay
- **Backend APIs:** GET /products/featured, /products/best-sellers, /products/signature, /products/seasonal, /products/new-arrivals, /categories, /collections, /products/:id/reviews (sample)
- **Database Tables:** products, categories, collections, reviews

### Categories (Shop Tab)

- **Purpose:** Browse products by scent family
- **UI:** Responsive 2-col grid of editorial category tiles
- **Business Logic:** Tapping tile → product listing filtered by categoryId
- **Backend APIs:** GET /categories
- **Database Tables:** categories

### Product Listing

- **Purpose:** Filterable, sortable grid of products
- **UI:** Chip row for scent family filters; sort bottom sheet (Featured, Price ASC/DESC, Top Rated); responsive FlashList grid
- **Business Logic:** Client-side filter + sort on top of fetched product arrays; pagination needed for scale
- **Backend APIs:** GET /products?categoryId=&q=&family=&sort=&page=&limit=
- **Database Tables:** products

### Product Details

- **Purpose:** Full product page with purchase action
- **UI:** Image gallery hero; fragrance notes chips; size selector (30/50/75/100ml); QuantityStepper; sticky Add-to-Cart bar; Reviews preview; Related products rail
- **Business Logic:** Size selection determines volume (currently cosmetic); Add to cart updates local store; wishlist toggle syncs per-user
- **Backend APIs:** GET /products/:id, GET /products/:id/reviews, GET /products?categoryId=&limit=6 (related)
- **Database Tables:** products, reviews, wishlist

### Search

- **Purpose:** Real-time debounced search modal
- **UI:** Autofocus SearchBar; Recent searches chips; Trending terms; Results grid
- **Business Logic:** 350ms debounce; searches name, brand, scentFamily, notes; recent searches persisted locally (max 8)
- **Backend APIs:** GET /products/search?q=
- **Database Tables:** products (full-text index)

### Wishlist

- **Purpose:** Saved products tab; persisted per user
- **UI:** Grid of saved ProductCards; Empty state; "Add all to cart" button
- **Business Logic:** Stores product IDs only; fetches full product details by IDs; heart toggle on any ProductCard syncs wishlist
- **Backend APIs:** GET /wishlist, POST /wishlist, DELETE /wishlist/:productId, GET /products?ids=p1,p2,...
- **Database Tables:** wishlist_items

### Cart

- **Purpose:** Review items before checkout
- **UI:** Line items with QuantityStepper + swipe delete; OrderSummary footer; Proceed to Checkout CTA
- **Business Logic:** Currently client-only (Zustand + AsyncStorage). Shipping: free ≥ 250 AED, else 20 AED flat. Cart cleared on order success.
- **Backend APIs:** Optional: POST /cart/sync (merge on login)
- **Database Tables:** Optional: carts, cart_items

### Checkout

- **Purpose:** 4-step purchase flow
- **UI:** Stepper progress; Address form → Delivery selector → Payment selector → Review → OrderSuccess
- **Business Logic:** Guest gets sign-in prompt at step 0 (optional). Delivery: Standard (free/included) vs Express (30 AED). Payment: Card, Wallet, Cash on Delivery. Places order via mutation; clears cart; invalidates orders query.
- **Backend APIs:** POST /orders
- **Database Tables:** orders, order_items, addresses

### Orders

- **Purpose:** Order history list
- **UI:** FlashList of OrderCards (status badge, thumbnails, total); Empty state
- **Business Logic:** Status flow: processing → shipped → delivered / cancelled
- **Backend APIs:** GET /orders (authenticated)
- **Database Tables:** orders, order_items

### Notifications

- **Purpose:** In-app notification centre
- **UI:** List of NotificationItems (icon per kind, read/unread dot); "Read all" button; Empty state
- **Business Logic:** Read state tracked locally + can be persisted to backend; kinds: order, promo, system, wishlist
- **Backend APIs:** GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
- **Database Tables:** notifications

### Profile

- **Purpose:** Account hub (session-aware)
- **UI:** Avatar + name + tier badge (or guest sign-in CTA); Stats row (Orders, Wishlist, Cart counts); Menu rows to all account screens
- **Business Logic:** Guest vs authenticated display logic; Sign out clears session
- **Backend APIs:** GET /auth/me
- **Database Tables:** users

### Settings

- **Purpose:** App preferences
- **UI:** Theme mode chips (Light/Dark/System); Notification toggles; Region (currency, language)
- **Business Logic:** Theme stored in AsyncStorage. Notification preferences should sync to backend for push delivery control.
- **Backend APIs:** PATCH /users/me/preferences
- **Database Tables:** user_preferences

### About

- **Purpose:** Brand story content page
- **UI:** Hero image + timeline (4 milestones) + Values grid (4 cards)
- **Business Logic:** Static content (can be CMS-driven in v2)
- **Backend APIs:** None (static) or GET /cms/about
- **Database Tables:** None (or cms_pages)

### Contact

- **Purpose:** Contact form + info
- **UI:** 4 contact info rows (phone, email, address, hours); 3-field message form (name, email, message)
- **Business Logic:** Form submits to backend which emails concierge team
- **Backend APIs:** POST /contact
- **Database Tables:** contact_submissions (optional)

---

## 4. Screen Documentation

| Screen          | Route              | Key APIs                                      | Inputs                     | Outputs                | Protected |
| --------------- | ------------------ | --------------------------------------------- | -------------------------- | ---------------------- | --------- |
| Splash          | `/`                | None                                          | —                          | Redirect               | No        |
| Onboarding      | `/onboarding`      | None                                          | —                          | Marks complete         | No        |
| Login           | `/(auth)/login`    | POST /auth/sign-in                            | email, password            | JWT tokens, User       | No        |
| Register        | `/(auth)/register` | POST /auth/sign-up                            | fullName, email, password  | JWT tokens, User       | No        |
| Home            | `/(tabs)`          | GET /products/\* + /categories + /collections | —                          | Product/category lists | No        |
| Shop            | `/(tabs)/shop`     | GET /categories                               | —                          | Category list          | No        |
| Wishlist        | `/(tabs)/wishlist` | GET /wishlist + GET /products?ids=            | —                          | Saved products         | Yes       |
| Cart            | `/(tabs)/cart`     | Local store                                   | —                          | Cart items + totals    | No        |
| Profile         | `/(tabs)/profile`  | GET /auth/me                                  | —                          | User info              | Partial   |
| Product Listing | `/products`        | GET /products?filters                         | categoryId?, query?        | Filtered products      | No        |
| Product Details | `/product/[id]`    | GET /products/:id + reviews + related         | id param                   | Product + reviews      | No        |
| Search          | `/search`          | GET /products/search?q=                       | query string               | Search results         | No        |
| Checkout        | `/checkout`        | POST /orders                                  | address, delivery, payment | Order reference        | Partial   |
| Orders          | `/orders`          | GET /orders                                   | —                          | Order list             | Yes       |
| Notifications   | `/notifications`   | GET /notifications, PATCH read                | —                          | Notifications          | Yes       |
| Settings        | `/settings`        | PATCH /users/me/preferences                   | preferences                | —                      | Partial   |
| About           | `/about`           | None                                          | —                          | Static content         | No        |
| Contact         | `/contact`         | POST /contact                                 | name, email, message       | —                      | No        |

---

## 5. Component Documentation (Backend-relevant)

### ProductCard

- **Props:** `product: Product`, `width: number`, `onPress?`
- **API dependency:** Receives Product from parent (fetched via query hooks)
- **Actions:** add-to-cart (cart store), wishlist toggle (wishlist store → /wishlist API)

### OrderCard

- **Props:** `order: Order`, `onPress?`
- **API dependency:** Receives Order (fetched via /orders)
- **Displays:** reference, date, status badge, product thumbnails (up to 3), total

### NotificationItem

- **Props:** `notification: AppNotification`, `onPress?`
- **API dependency:** Receives AppNotification from /notifications

### OrderSummary

- **Props:** `summary: CartSummary`
- **No API dependency:** Computed from cart items client-side

### ReviewCard

- **Props:** `review: Review`, `width?`
- **API dependency:** Receives Review from /products/:id/reviews

### WishlistButton

- **Props:** `productId: string`
- **API dependency:** Reads/writes wishlist store → syncs to /wishlist endpoints

---

## 6. Navigation Flow

```
Splash (/)
│
├── First launch → /onboarding → /(tabs)/index
└── Returning → /(tabs)/index
                    │
                    ├── /(tabs)/shop
                    │       └── /products?categoryId=xxx
                    │               └── /product/[id]
                    │                       └── /checkout
                    │                               └── /(auth)/login (optional)
                    │                               └── /orders (post-checkout)
                    │
                    ├── /(tabs)/wishlist
                    │       └── /product/[id]
                    │
                    ├── /(tabs)/cart
                    │       └── /checkout
                    │
                    ├── /(tabs)/profile
                    │       ├── /(auth)/login (guest)
                    │       ├── /orders
                    │       ├── /(tabs)/wishlist
                    │       ├── /notifications
                    │       ├── /settings
                    │       ├── /about
                    │       └── /contact
                    │
                    └── /search (modal)
                            └── /product/[id]

Protected routes (require auth): /orders, /(tabs)/wishlist (synced), /notifications (synced)
Guest routes: all others (cart and wishlist work locally; sync on login)
```

---

## 7. Business Logic

### Shipping

- Free if subtotal ≥ 250 AED or subtotal === 0
- Flat fee: 20 AED otherwise
- Express delivery: additional 30 AED (charged on top of base shipping)

### Cart

- Client-side (Zustand + AsyncStorage). Multi-device sync optional.
- Cart cleared on order placement success.
- Quantity stepper: min 1 (decrement to 0 removes item).

### Wishlist

- Per-user, synced to backend when authenticated.
- Guest wishlist stored locally; merged on login.
- Stores only product IDs; full product data fetched via /products?ids=.

### Checkout Flow

1. Address form (fullName, phone, address, city) — Zod validated
2. Delivery method: Standard (free or included) vs Express (+30 AED)
3. Payment: Card / Digital Wallet / Cash on Delivery
4. Order review → POST /orders → clear cart → show success with reference number

### Order Status Lifecycle

```
processing → shipped → delivered
           → cancelled
```

### Pricing

- All prices in AED (integer, no decimals in app)
- `originalPrice` present when discounted; discount % = ((originalPrice - price) / originalPrice) \* 100
- `price` is always current selling price

### Products

- `isFeatured`: appears in Home hero sections
- `isNewArrival`: appears in New Arrivals section (also badge 'new')
- `isBestSeller`: appears in Best Sellers section (also badge 'bestseller')
- `isSignature`: appears in Signature collection
- `isSeasonal`: appears in Seasonal section
- `badge`: 'new' | 'bestseller' | 'limited' | 'exclusive' (display only, no logic gate)
- `inStock: false` → product shown with "Sold Out" overlay; Add to Cart disabled

### Search

- Searches: name, brand, scentFamily, notes (case-insensitive substring)
- Recent searches: max 8 terms, FIFO, deduplicated, persisted locally

### Reviews

- Attached to product (`productId` FK)
- `verified: boolean` — purchased and reviewed
- Displayed: up to 2 on Product Details; sample set on Home Reviews rail

### Loyalty Tiers

- Guest → Member (on registration) → Connoisseur → Maison Elite
- Tier displayed on Profile header badge
- Upgrade logic TBD (order count / total spend thresholds)

### Notifications Kinds

- `order`: Shipping/delivery updates for specific orders
- `promo`: Marketing (sales, private events)
- `system`: Account/app messages
- `wishlist`: Back-in-stock alerts for wishlisted products

### Authentication

- Email/password only in v1. Social auth (Apple, Google) reserved for v2.
- Guest checkout: no account required; order linked to email address
- Post-purchase account creation: use checkout email to pre-fill register form

---

## 8. State Management

### cart.store (Zustand + AsyncStorage)

- **State:** `items: CartItem[]`
- **Actions:** addItem, removeItem, setQuantity, increment, decrement, clear
- **Persistence:** `@al_madina/cart` (AsyncStorage)
- **Backend dependency:** POST /orders (checkout); optional POST /cart/sync (multi-device)
- **Shipping computed:** free ≥ 250 AED, else 20 AED flat

### wishlist.store (Zustand + AsyncStorage)

- **State:** `ids: string[]`
- **Actions:** toggle, add, remove, clear, has
- **Persistence:** `@al_madina/wishlist` (AsyncStorage)
- **Backend dependency:** GET /wishlist, POST /wishlist, DELETE /wishlist/:productId

### session.store (Zustand + AsyncStorage)

- **State:** `user: User | null`, `isAuthenticated: boolean`
- **Actions:** signIn(email), signUp(fullName, email), signOut
- **Persistence:** `@al_madina/auth_token` (AsyncStorage)
- **Backend dependency:** POST /auth/sign-in, POST /auth/sign-up, POST /auth/sign-out, GET /auth/me
- **Token strategy:** Store JWT in SecureStore (not AsyncStorage in production); inject via Axios request interceptor

### ui.store (Zustand, no persistence)

- **State:** `toasts: ToastConfig[]`
- **Actions:** showToast, dismissToast
- **Backend dependency:** None (UI feedback only)

### search.store (Zustand + AsyncStorage)

- **State:** `recent: string[]` (max 8, FIFO, deduped)
- **Actions:** addRecent, removeRecent, clearRecent
- **Persistence:** `@al_madina/recent_searches` (AsyncStorage)
- **Backend dependency:** None (local only)

---

## 9. Data Models

### User

| Field           | Type          | Nullable | Required | Description                                 |
| --------------- | ------------- | -------- | -------- | ------------------------------------------- |
| id              | string (UUID) | No       | Yes      | Primary key                                 |
| fullName        | string        | No       | Yes      | Display name                                |
| email           | string        | No       | Yes      | Unique login email                          |
| passwordHash    | string        | No       | Yes      | bcrypt hash                                 |
| avatar          | string        | Yes      | No       | Profile image URL (Cloudinary)              |
| memberSince     | date          | No       | Yes      | Registration date                           |
| tier            | enum          | No       | Yes      | 'Member' \| 'Connoisseur' \| 'Maison Elite' |
| isEmailVerified | boolean       | No       | Yes      | Email verification flag                     |
| isActive        | boolean       | No       | Yes      | Soft-delete/ban                             |
| createdAt       | timestamp     | No       | Yes      | Audit                                       |
| updatedAt       | timestamp     | No       | Yes      | Audit                                       |

### Product

| Field         | Type          | Nullable | Required | Description                                                  |
| ------------- | ------------- | -------- | -------- | ------------------------------------------------------------ |
| id            | string (UUID) | No       | Yes      | Primary key                                                  |
| name          | string        | No       | Yes      | Product name                                                 |
| nameAr        | string        | Yes      | No       | Arabic name                                                  |
| brand         | string        | No       | Yes      | Brand name (always 'Al Madina' for now)                      |
| categoryId    | UUID (FK)     | No       | Yes      | → categories.id                                              |
| description   | text          | No       | Yes      | Long-form description                                        |
| notes         | string[]      | No       | Yes      | Fragrance notes (JSON array)                                 |
| scentFamily   | enum          | No       | Yes      | 'oud'\|'floral'\|'amber'\|'musk'\|'woody'\|'citrus'\|'spicy' |
| volumeMl      | integer       | No       | Yes      | Volume in ml                                                 |
| price         | decimal(10,2) | No       | Yes      | Current price (AED)                                          |
| originalPrice | decimal(10,2) | Yes      | No       | Pre-discount price                                           |
| currency      | string(3)     | No       | Yes      | Default 'AED'                                                |
| images        | string[]      | No       | Yes      | Ordered Cloudinary URLs                                      |
| rating        | decimal(3,2)  | No       | Yes      | Aggregate 0.00–5.00                                          |
| reviewCount   | integer       | No       | Yes      | Denormalized count                                           |
| inStock       | boolean       | No       | Yes      | Availability flag                                            |
| badge         | enum          | Yes      | No       | 'new'\|'bestseller'\|'limited'\|'exclusive'                  |
| isFeatured    | boolean       | No       | Yes      | Home hero sections                                           |
| isNewArrival  | boolean       | No       | Yes      | New arrivals section                                         |
| isBestSeller  | boolean       | No       | Yes      | Best sellers section                                         |
| isSignature   | boolean       | No       | Yes      | Signature collection                                         |
| isSeasonal    | boolean       | No       | Yes      | Seasonal section                                             |
| deletedAt     | timestamp     | Yes      | No       | Soft delete                                                  |
| createdAt     | timestamp     | No       | Yes      | Audit                                                        |
| updatedAt     | timestamp     | No       | Yes      | Audit                                                        |

### Category

| Field        | Type          | Nullable | Required | Description            |
| ------------ | ------------- | -------- | -------- | ---------------------- |
| id           | string (UUID) | No       | Yes      | Primary key            |
| name         | string        | No       | Yes      | Display name           |
| tagline      | string        | Yes      | No       | Short marketing phrase |
| image        | string        | No       | Yes      | Cloudinary URL         |
| productCount | integer       | No       | Yes      | Denormalized count     |
| sortOrder    | integer       | No       | Yes      | Display order          |
| createdAt    | timestamp     | No       | Yes      | Audit                  |

### Collection

| Field        | Type          | Nullable | Required | Description                   |
| ------------ | ------------- | -------- | -------- | ----------------------------- |
| id           | string (UUID) | No       | Yes      | Primary key                   |
| title        | string        | No       | Yes      | Collection name               |
| subtitle     | string        | No       | Yes      | Descriptive tagline           |
| image        | string        | No       | Yes      | Cloudinary URL                |
| accent       | enum          | No       | Yes      | 'gold'\|'emerald'\|'burgundy' |
| productCount | integer       | No       | Yes      | Denormalized count            |
| sortOrder    | integer       | No       | Yes      | Display order                 |
| createdAt    | timestamp     | No       | Yes      | Audit                         |

### CollectionProduct (junction)

| Field        | Type      | Nullable | Required |
| ------------ | --------- | -------- | -------- |
| collectionId | UUID (FK) | No       | Yes      |
| productId    | UUID (FK) | No       | Yes      |
| sortOrder    | integer   | No       | Yes      |

### Review

| Field     | Type          | Nullable | Required | Description               |
| --------- | ------------- | -------- | -------- | ------------------------- |
| id        | string (UUID) | No       | Yes      | Primary key               |
| productId | UUID (FK)     | No       | Yes      | → products.id             |
| userId    | UUID (FK)     | Yes      | No       | → users.id (null = guest) |
| author    | string        | No       | Yes      | Display name              |
| avatar    | string        | Yes      | No       | Profile image URL         |
| rating    | integer       | No       | Yes      | 1–5                       |
| title     | string        | No       | Yes      | Review headline           |
| body      | text          | No       | Yes      | Review body               |
| date      | date          | No       | Yes      | Review date               |
| verified  | boolean       | No       | Yes      | Verified purchase         |
| deletedAt | timestamp     | Yes      | No       | Soft delete               |
| createdAt | timestamp     | No       | Yes      | Audit                     |

### WishlistItem

| Field     | Type      | Nullable | Required |
| --------- | --------- | -------- | -------- |
| id        | UUID      | No       | Yes      |
| userId    | UUID (FK) | No       | Yes      |
| productId | UUID (FK) | No       | Yes      |
| createdAt | timestamp | No       | Yes      |

### Order

| Field           | Type          | Nullable | Required | Description                                       |
| --------------- | ------------- | -------- | -------- | ------------------------------------------------- |
| id              | UUID          | No       | Yes      | Primary key                                       |
| reference       | string        | No       | Yes      | Human-readable 'AM-10293'                         |
| userId          | UUID (FK)     | Yes      | No       | Null for guest orders                             |
| guestEmail      | string        | Yes      | No       | Guest checkout email                              |
| status          | enum          | No       | Yes      | 'processing'\|'shipped'\|'delivered'\|'cancelled' |
| shippingAddress | jsonb         | No       | Yes      | {fullName, phone, address, city}                  |
| deliveryMethod  | enum          | No       | Yes      | 'standard'\|'express'                             |
| paymentMethod   | enum          | No       | Yes      | 'card'\|'wallet'\|'cod'                           |
| subtotal        | decimal(10,2) | No       | Yes      | Pre-shipping total                                |
| shipping        | decimal(10,2) | No       | Yes      | Shipping fee                                      |
| total           | decimal(10,2) | No       | Yes      | Grand total                                       |
| currency        | string(3)     | No       | Yes      | 'AED'                                             |
| placedAt        | timestamp     | No       | Yes      | Order placement time                              |
| deletedAt       | timestamp     | Yes      | No       | Soft delete                                       |
| createdAt       | timestamp     | No       | Yes      | Audit                                             |
| updatedAt       | timestamp     | No       | Yes      | Audit                                             |

### OrderItem

| Field        | Type          | Nullable | Required |
| ------------ | ------------- | -------- | -------- | ------------------------- |
| id           | UUID          | No       | Yes      |
| orderId      | UUID (FK)     | No       | Yes      |
| productId    | UUID (FK)     | No       | Yes      |
| productName  | string        | No       | Yes      | Snapshot at purchase time |
| productImage | string        | No       | Yes      | Snapshot at purchase time |
| price        | decimal(10,2) | No       | Yes      | Snapshot at purchase time |
| quantity     | integer       | No       | Yes      |
| volumeMl     | integer       | No       | Yes      | Selected volume           |

### AppNotification

| Field     | Type      | Nullable | Required |
| --------- | --------- | -------- | -------- | -------------------------------------- |
| id        | UUID      | No       | Yes      |
| userId    | UUID (FK) | No       | Yes      |
| kind      | enum      | No       | Yes      | 'order'\|'promo'\|'system'\|'wishlist' |
| title     | string    | No       | Yes      |
| body      | text      | No       | Yes      |
| read      | boolean   | No       | Yes      |
| date      | date      | No       | Yes      |
| metadata  | jsonb     | Yes      | No       | e.g., {orderId, productId}             |
| createdAt | timestamp | No       | Yes      |

### RefreshToken

| Field     | Type      | Nullable | Required |
| --------- | --------- | -------- | -------- | ------------ |
| id        | UUID      | No       | Yes      |
| userId    | UUID (FK) | No       | Yes      |
| token     | string    | No       | Yes      | Hashed token |
| expiresAt | timestamp | No       | Yes      |
| revokedAt | timestamp | Yes      | No       |
| createdAt | timestamp | No       | Yes      |

### UserPreference

| Field               | Type          | Nullable | Required |
| ------------------- | ------------- | -------- | -------- | ------------------------- |
| userId              | UUID (FK, PK) | No       | Yes      |
| themeMode           | enum          | No       | Yes      | 'light'\|'dark'\|'system' |
| promosEnabled       | boolean       | No       | Yes      |
| orderUpdatesEnabled | boolean       | No       | Yes      |
| currency            | string(3)     | No       | Yes      |
| language            | string(5)     | No       | Yes      |

### ContactSubmission

| Field     | Type      | Nullable | Required |
| --------- | --------- | -------- | -------- |
| id        | UUID      | No       | Yes      |
| name      | string    | No       | Yes      |
| email     | string    | No       | Yes      |
| message   | text      | No       | Yes      |
| createdAt | timestamp | No       | Yes      |

---

## 10. Complete API Specification

### Base URL

`https://api.almadina.com/v1`

### Response Envelope

```json
{
  "data": <T>,
  "message": "optional string"
}
```

### Error Envelope

```json
{
  "status": 400,
  "message": "Human-readable error",
  "code": "MACHINE_CODE",
  "details": {}
}
```

---

### Auth Endpoints

#### POST /auth/sign-up

- **Auth:** None
- **Body:** `{ fullName: string, email: string, password: string }`
- **Validation:** fullName min 2, email valid, password min 6
- **Response 201:** `{ data: { user: User, accessToken: string, refreshToken: string } }`
- **Errors:** 409 EMAIL_TAKEN, 422 VALIDATION_ERROR

#### POST /auth/sign-in

- **Auth:** None
- **Body:** `{ email: string, password: string }`
- **Response 200:** `{ data: { user: User, accessToken: string, refreshToken: string } }`
- **Errors:** 401 INVALID_CREDENTIALS, 422 VALIDATION_ERROR

#### POST /auth/sign-out

- **Auth:** Bearer token
- **Body:** `{ refreshToken: string }`
- **Response 200:** `{ data: null, message: "Signed out" }`

#### POST /auth/refresh

- **Auth:** None
- **Body:** `{ refreshToken: string }`
- **Response 200:** `{ data: { accessToken: string, refreshToken: string } }`
- **Errors:** 401 TOKEN_EXPIRED, 401 TOKEN_REVOKED

#### GET /auth/me

- **Auth:** Bearer token
- **Response 200:** `{ data: User }`
- **Errors:** 401 UNAUTHORIZED

#### POST /auth/forgot-password

- **Auth:** None
- **Body:** `{ email: string }`
- **Response 200:** `{ data: null, message: "Reset email sent if account exists" }`

#### POST /auth/reset-password

- **Auth:** None
- **Body:** `{ token: string, password: string }`
- **Response 200:** `{ data: null, message: "Password updated" }`
- **Errors:** 400 TOKEN_INVALID, 400 TOKEN_EXPIRED

---

### Products Endpoints

#### GET /products

- **Auth:** None
- **Query:** `?page=1&limit=20&categoryId=&family=&sort=featured|price_asc|price_desc|rating&isFeatured=&isNewArrival=&isBestSeller=&isSignature=&isSeasonal=`
- **Response 200:** `{ data: Paginated<Product> }`

#### GET /products/search

- **Auth:** None
- **Query:** `?q=oud&page=1&limit=20`
- **Response 200:** `{ data: Paginated<Product> }`

#### GET /products/featured

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

#### GET /products/new-arrivals

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

#### GET /products/best-sellers

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

#### GET /products/signature

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

#### GET /products/seasonal

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

#### GET /products/:id

- **Auth:** None
- **Response 200:** `{ data: Product }`
- **Errors:** 404 PRODUCT_NOT_FOUND

#### GET /products/:id/reviews

- **Auth:** None
- **Query:** `?page=1&limit=10`
- **Response 200:** `{ data: Paginated<Review> }`

#### GET /products (by IDs)

- **Auth:** None
- **Query:** `?ids=p-001,p-002,p-003`
- **Response 200:** `{ data: Product[] }`

---

### Categories Endpoints

#### GET /categories

- **Auth:** None
- **Response 200:** `{ data: Category[] }`

#### GET /categories/:id/products

- **Auth:** None
- **Query:** `?page=1&limit=20&sort=featured`
- **Response 200:** `{ data: Paginated<Product> }`

---

### Collections Endpoints

#### GET /collections

- **Auth:** None
- **Response 200:** `{ data: Collection[] }`

#### GET /collections/:id/products

- **Auth:** None
- **Response 200:** `{ data: Product[] }`

---

### Wishlist Endpoints (Protected)

#### GET /wishlist

- **Auth:** Bearer token
- **Response 200:** `{ data: { productIds: string[] } }`

#### POST /wishlist

- **Auth:** Bearer token
- **Body:** `{ productId: string }`
- **Response 201:** `{ data: { productId: string } }`
- **Errors:** 404 PRODUCT_NOT_FOUND, 409 ALREADY_IN_WISHLIST

#### DELETE /wishlist/:productId

- **Auth:** Bearer token
- **Response 200:** `{ data: null, message: "Removed from wishlist" }`
- **Errors:** 404 NOT_IN_WISHLIST

---

### Orders Endpoints

#### GET /orders

- **Auth:** Bearer token
- **Query:** `?page=1&limit=20&status=`
- **Response 200:** `{ data: Paginated<Order> }`

#### POST /orders

- **Auth:** Optional (guest via guestEmail)
- **Body:**

```json
{
  "items": [{ "productId": "uuid", "quantity": 2, "volumeMl": 50 }],
  "shippingAddress": {
    "fullName": "...",
    "phone": "...",
    "address": "...",
    "city": "..."
  },
  "deliveryMethod": "standard",
  "paymentMethod": "card",
  "guestEmail": "optional@email.com"
}
```

- **Response 201:** `{ data: Order }`
- **Errors:** 400 CART_EMPTY, 422 VALIDATION_ERROR, 409 PRODUCT_OUT_OF_STOCK

#### GET /orders/:id

- **Auth:** Bearer token (or guest via reference + email)
- **Response 200:** `{ data: Order }`
- **Errors:** 404 ORDER_NOT_FOUND, 403 FORBIDDEN

---

### Notifications Endpoints (Protected)

#### GET /notifications

- **Auth:** Bearer token
- **Query:** `?page=1&limit=20`
- **Response 200:** `{ data: Paginated<AppNotification> }`

#### PATCH /notifications/:id/read

- **Auth:** Bearer token
- **Response 200:** `{ data: AppNotification }`

#### PATCH /notifications/read-all

- **Auth:** Bearer token
- **Response 200:** `{ data: null, message: "All marked as read" }`

---

### User Endpoints (Protected)

#### PATCH /users/me

- **Auth:** Bearer token
- **Body:** `{ fullName?: string, avatar?: string }`
- **Response 200:** `{ data: User }`

#### PATCH /users/me/preferences

- **Auth:** Bearer token
- **Body:** `{ themeMode?, promosEnabled?, orderUpdatesEnabled?, currency?, language? }`
- **Response 200:** `{ data: UserPreference }`

---

### Contact Endpoint

#### POST /contact

- **Auth:** None
- **Body:** `{ name: string, email: string, message: string }`
- **Validation:** name min 2, email valid, message min 10
- **Response 200:** `{ data: null, message: "Message received" }`

---

### Admin Endpoints (Role: admin)

#### Products CRUD

- `POST /admin/products` — Create product
- `PATCH /admin/products/:id` — Update product
- `DELETE /admin/products/:id` — Soft delete
- `POST /admin/products/:id/images` — Upload images (multipart)

#### Categories CRUD

- `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`

#### Collections CRUD

- `POST /admin/collections`, `PATCH /admin/collections/:id`, `DELETE /admin/collections/:id`
- `POST /admin/collections/:id/products` — Add product
- `DELETE /admin/collections/:id/products/:productId` — Remove product

#### Orders Management

- `GET /admin/orders?status=&page=` — All orders
- `PATCH /admin/orders/:id/status` — Update order status
- `GET /admin/orders/stats` — Dashboard stats (count by status, revenue)

#### Customers

- `GET /admin/users?page=&tier=` — All users
- `GET /admin/users/:id` — User + orders
- `PATCH /admin/users/:id/tier` — Update loyalty tier
- `DELETE /admin/users/:id` — Deactivate

#### Notifications (Broadcast)

- `POST /admin/notifications` — Send notification to all / segment

#### Reviews

- `GET /admin/reviews?page=` — All reviews
- `DELETE /admin/reviews/:id` — Remove review

#### Dashboard

- `GET /admin/dashboard` — Revenue, orders, products, users count + recent orders

---

## 11. Database Design

### Tables Summary

```
users
refresh_tokens
user_preferences
categories
products
collection_products (junction)
collections
reviews
wishlist_items
orders
order_items
notifications
contact_submissions
```

### Key Relationships

- `products.categoryId` → `categories.id` (Many-to-One)
- `collection_products.collectionId` → `collections.id` (Many-to-Many with products)
- `collection_products.productId` → `products.id`
- `reviews.productId` → `products.id` (Many-to-One)
- `reviews.userId` → `users.id` (nullable: guest reviews)
- `wishlist_items.userId` → `users.id` (Many-to-One)
- `wishlist_items.productId` → `products.id`
- `orders.userId` → `users.id` (nullable: guest orders)
- `order_items.orderId` → `orders.id`
- `order_items.productId` → `products.id`
- `notifications.userId` → `users.id`
- `refresh_tokens.userId` → `users.id`
- `user_preferences.userId` → `users.id` (One-to-One)

### Indexes

```sql
-- Products
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_scent_family ON products("scentFamily");
CREATE INDEX idx_products_flags ON products("isFeatured", "isNewArrival", "isBestSeller", "isSignature", "isSeasonal");
CREATE INDEX idx_products_in_stock ON products("inStock");
CREATE INDEX idx_products_deleted ON products("deletedAt");
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || brand || ' ' || description));

-- Orders
CREATE INDEX idx_orders_user ON orders("userId");
CREATE INDEX idx_orders_status ON orders(status);

-- Wishlist
CREATE UNIQUE INDEX idx_wishlist_user_product ON wishlist_items("userId", "productId");

-- Notifications
CREATE INDEX idx_notifications_user ON notifications("userId");
CREATE INDEX idx_notifications_read ON notifications("userId", read);

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens("userId");
CREATE UNIQUE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### Cascade Rules

- `orders` DELETE → SET NULL on `userId` (preserve guest orders)
- `order_items` → CASCADE DELETE with `orderId`
- `wishlist_items` → CASCADE DELETE with `userId` or `productId`
- `notifications` → CASCADE DELETE with `userId`
- `refresh_tokens` → CASCADE DELETE with `userId`
- `reviews` → SET NULL on `userId` (preserve review content)

### Soft Delete

- `products`: `deletedAt` timestamp (exclude in all queries with `WHERE deletedAt IS NULL`)
- `orders`: `deletedAt` timestamp
- `reviews`: `deletedAt` timestamp
- `users`: `isActive: boolean` (set false rather than delete)

### Audit Fields

All tables: `createdAt`, `updatedAt` (auto-managed by Prisma)

---

## 12. Authentication

### Strategy

- **Access Token:** JWT, 15-minute expiry, signed with RS256 (or HS256 for simplicity)
- **Refresh Token:** Opaque random token, 30-day expiry, stored hashed in DB
- **Rotation:** Issue new refresh token on each refresh call; revoke old one
- **Storage (mobile):** Access token in memory (React Native); refresh token in `expo-secure-store`
- **Password Hashing:** bcrypt with salt rounds 12

### Token Payload (Access)

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tier": "Member",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Auth Middleware

```typescript
// Attach user to request if valid Bearer token
// authRequired: throws 401 if no/invalid token
// authOptional: attaches user if token present, continues if not
```

### Role-Based Access

- `user` — authenticated customer
- `admin` — full backend access
- `guest` — unauthenticated (no role)

### Guest Checkout

- POST /orders accepts `guestEmail` in body without Bearer token
- Order linked to email; can track via reference number

### Password Reset Flow

1. POST /auth/forgot-password → generate reset token (UUID, 1-hour expiry), email link
2. User clicks link → frontend sends POST /auth/reset-password with token + new password
3. Token invalidated after use

---

## 13. File Upload Requirements

### Product Images

- Max size: 10 MB per image
- Accepted formats: JPEG, PNG, WebP
- Storage: Cloudinary (folder: `almadina/products/:productId/`)
- Transformations: auto-format, auto-quality, sizes: 400px, 800px, 1200px (responsive variants)
- Naming: `{productId}_{index}_{timestamp}`
- Return: Cloudinary secure URL + public_id

### User Avatars

- Max size: 5 MB
- Accepted formats: JPEG, PNG
- Storage: Cloudinary (`almadina/users/:userId/avatar`)
- Transformation: 300×300 face-detect crop, auto-quality
- Returns: Cloudinary secure URL

### Category / Collection Images

- Max size: 10 MB
- Storage: Cloudinary (`almadina/categories/`, `almadina/collections/`)
- Transformation: 800×600 auto-crop

### Upload Endpoint

- `POST /admin/upload` — multipart/form-data, field: `file`, query: `?type=product|avatar|category|collection`
- Returns: `{ data: { url: string, publicId: string } }`

### CDN

- Cloudinary CDN serves all images with transformation URLs
- No direct filesystem storage; all via Cloudinary SDK

---

## 14. Payment Requirements

### Phase 1 (Current)

- Payment method selection is cosmetic only (Card, Wallet, COD)
- No actual payment processing
- Order placed → status: 'processing' immediately

### Phase 2 (Production)

**Stripe Integration (recommended for UAE)**

- Payment Intent created on POST /orders
- Client confirms via Stripe SDK (React Native stripe-react-native)
- Webhook: `payment_intent.succeeded` → update order to processing
- Webhook: `payment_intent.payment_failed` → mark order failed

**Order Lifecycle**

```
created → payment_pending → payment_confirmed → processing → shipped → delivered
                          → payment_failed
                          → cancelled
```

**Refund**

- PATCH /admin/orders/:id/refund → Stripe refund + status 'refunded'

**Webhook Security**

- Verify Stripe-Signature header using webhook secret
- Idempotency: check if order already processed before updating

---

## 15. Notification Requirements

### In-App Notifications

- Stored in `notifications` table per user
- Fetched via GET /notifications
- Read state: PATCH /notifications/:id/read
- Types: order (order updates), promo (marketing), system (account), wishlist (back-in-stock)

### Push Notifications

**Provider:** Firebase Cloud Messaging (FCM) for Android + APNs for iOS via Expo Push Notifications

**Flow:**

1. Client registers push token via `expo-notifications`
2. Token sent to backend: `POST /users/me/push-token` `{ token: string, platform: 'ios'|'android' }`
3. Backend stores token in `push_tokens` table (per user, multiple devices)
4. BullMQ job sends push via Expo Push API or FCM directly

**Trigger Points:**

- Order status change → push to order owner
- New promo/private sale → push to all (segmented by tier if needed)
- Back-in-stock for wishlisted product → push to all who wishlisted it
- Welcome notification on registration (system)

**push_tokens table:**

```
id UUID, userId UUID FK, token string, platform enum, createdAt timestamp
```

### Email Notifications (Nodemailer / Resend)

- Order confirmation email (on POST /orders success)
- Shipping update email (on status → 'shipped')
- Password reset email
- Contact form auto-reply

---

## 16. Search Requirements

### Full-Text Search

- PostgreSQL `tsvector` index on products: name, nameAr, brand, description, notes (concatenated)
- Query via `to_tsquery` with `plainto_tsquery` for natural language
- Fallback to ILIKE for simple substring match

### Filters

- `categoryId` — filter by category
- `family` — filter by scentFamily enum
- `inStock` — only available products
- `minPrice` / `maxPrice` — price range
- `badge` — filter by badge type

### Sorting

- `featured` — isFeatured DESC, rating DESC (default)
- `price_asc` — price ASC
- `price_desc` — price DESC
- `rating` — rating DESC, reviewCount DESC
- `newest` — createdAt DESC

### Pagination

- Default: page=1, limit=20
- Max limit: 50
- Response includes: `{ items, page, pageSize, total, hasMore }`

### Autocomplete / Suggestions

- Endpoint: `GET /products/suggest?q=oud&limit=5`
- Returns top 5 product names matching prefix

### Trending Terms

- Hardcoded in v1: ['Oud', 'Rose', 'Amber', 'Saffron', 'Musk']
- v2: Track search term frequency in `search_logs` table; expose `GET /search/trending`

### Recently Viewed

- Stored client-side in v1 (AsyncStorage)
- v2: `POST /users/me/recently-viewed { productId }` + `GET /users/me/recently-viewed`

---

## 17. Admin Requirements

### Dashboard

- Total orders (today/week/month)
- Revenue (today/week/month)
- Total products / out-of-stock count
- Total customers
- Recent orders list (last 10)
- Top products by revenue

### Products

- CRUD with image upload
- Bulk status update (inStock toggle)
- Badge assignment
- Flag toggles (isFeatured, isNewArrival, etc.)

### Categories

- CRUD with image upload
- Sort order management

### Collections

- CRUD with image upload
- Product assignment (add/remove/reorder)

### Orders

- Filter by status, date range, customer
- Status update (processing → shipped → delivered / cancelled)
- Order details view with line items

### Customers

- List with search, filter by tier
- Customer profile: orders, wishlist, preferences
- Tier upgrade/downgrade
- Account deactivation

### Notifications

- Broadcast notification to all users
- Target by tier or segment
- Message history

### Reviews

- List all reviews with filter by rating, product
- Soft delete inappropriate reviews

### Reports

- Revenue by category
- Best-selling products
- Customer acquisition (registrations by date)
- Order status breakdown

### Roles & Permissions

- `admin`: full access
- `manager`: orders + products (no user deletion, no broadcasts)
- Role stored in JWT payload; enforced in `requireRole` middleware

---

## 18. Security

### Authentication & Authorization

- JWT with short-lived access tokens (15 min)
- Refresh token rotation + revocation
- Role-based middleware (`requireAuth`, `requireAdmin`, `requireRole`)
- Password hashing: bcrypt rounds 12

### Validation

- All request bodies validated via Zod schemas server-side (same schemas as frontend where possible)
- Sanitize string inputs (strip HTML)
- Validate UUIDs before DB queries

### Rate Limiting

```typescript
// express-rate-limit
POST /auth/sign-in: 5 req/15min per IP
POST /auth/sign-up: 10 req/1hr per IP
POST /auth/forgot-password: 3 req/1hr per IP
GET /products/search: 60 req/min per IP
POST /orders: 10 req/hr per user
```

### Helmet

- `helmet()` middleware: X-Frame-Options, X-XSS-Protection, Content-Security-Policy, HSTS

### CORS

```typescript
cors({
  origin: ["https://almadina.com", "exp://*", "your-expo-url"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
});
```

### SQL Injection Prevention

- Prisma ORM parameterizes all queries — no raw SQL except indexed search (use tagged template literals with Prisma.$queryRaw`...`)

### Input Sanitization

- `DOMPurify` or `sanitize-html` on any user-generated rich text (reviews, contact messages)

### XSS Prevention

- Content-Type: application/json (no HTML rendering server-side)
- Helmet CSP headers

### Audit Logs

- Log all admin actions: who, what, when, IP → `audit_logs` table
- Log auth events: login, logout, failed attempts

### Encryption

- Passwords: bcrypt
- Refresh tokens: stored as SHA256 hash in DB
- Secrets (JWT secret, DB URL, Cloudinary key): environment variables only, never committed

---

## 19. Performance

### Caching (Redis)

```typescript
// Cache strategies
GET /categories → cache 24h (rarely changes)
GET /collections → cache 24h
GET /products/featured → cache 1h
GET /products/best-sellers → cache 1h
GET /products/:id → cache 30min (invalidate on admin update)
GET /products/search?q= → cache 5min per unique query
GET /orders (user-specific) → no cache (or 30s)
```

### Database

- Indexes on all FK columns and filter columns (see Section 11)
- Pagination on all list endpoints (no unbounded queries)
- Select only needed columns in Prisma queries
- Connection pooling via PgBouncer or Prisma connection limit config

### Image Optimization

- Cloudinary auto-format (WebP where supported) + auto-quality
- Responsive transformation URLs (400/800/1200px)
- Client specifies size via Cloudinary URL params

### Compression

- `compression` middleware (gzip) on all responses

### Background Jobs (BullMQ)

- Email sending (order confirmation, password reset)
- Push notification delivery (batch sends)
- Rating recalculation after new review
- Wishlist back-in-stock alerts (triggered by admin stock update)

### Pagination

- Default page size: 20 items
- Max page size: 50 items
- Cursor-based pagination for high-traffic endpoints (v2)

---

## 20. Backend Folder Structure

```
al-madina-backend/
├── src/
│   ├── config/
│   │   ├── index.ts              # Env validation (zod)
│   │   ├── database.ts           # Prisma client singleton
│   │   ├── redis.ts              # Redis client
│   │   ├── cloudinary.ts         # Cloudinary SDK config
│   │   └── logger.ts             # Pino logger
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts    # Zod schemas
│   │   │   └── auth.types.ts
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.repository.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── products.schema.ts
│   │   │   └── products.types.ts
│   │   ├── categories/
│   │   ├── collections/
│   │   ├── reviews/
│   │   ├── wishlist/
│   │   ├── cart/                 # Optional: server-side cart sync
│   │   ├── orders/
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── contact/
│   │   ├── search/
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.routes.ts
│   │       └── dashboard/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # requireAuth, authOptional, requireAdmin, requireRole
│   │   ├── validate.middleware.ts # Zod body/query/param validation
│   │   ├── error.middleware.ts   # Global error handler → ApiError shape
│   │   ├── rate-limit.middleware.ts
│   │   ├── upload.middleware.ts  # Multer config
│   │   └── audit.middleware.ts   # Admin action logging
│   │
│   ├── utils/
│   │   ├── api-error.ts          # ApiError class with status + code
│   │   ├── api-response.ts       # Standardized response helper
│   │   ├── jwt.ts                # sign/verify access + refresh tokens
│   │   ├── hash.ts               # bcrypt helpers
│   │   ├── paginate.ts           # Prisma pagination helper
│   │   ├── cache.ts              # Redis get/set/invalidate helpers
│   │   └── order-reference.ts    # Generate AM-XXXXX reference
│   │
│   ├── types/
│   │   ├── express.d.ts          # Augment Request: req.user
│   │   ├── api.types.ts          # ApiError, ApiResponse, Paginated
│   │   └── env.types.ts          # Typed env config
│   │
│   ├── jobs/
│   │   ├── queues/
│   │   │   ├── email.queue.ts
│   │   │   ├── push.queue.ts
│   │   │   └── notification.queue.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   ├── push.processor.ts
│   │   │   └── notification.processor.ts
│   │   └── index.ts              # Queue registration
│   │
│   ├── emails/
│   │   ├── templates/
│   │   │   ├── order-confirmation.html
│   │   │   ├── shipping-update.html
│   │   │   ├── password-reset.html
│   │   │   └── contact-auto-reply.html
│   │   └── mailer.ts             # Nodemailer / Resend setup
│   │
│   ├── storage/
│   │   └── upload.ts             # Cloudinary upload helper + Multer memoryStorage
│   │
│   ├── constants/
│   │   ├── error-codes.ts        # Machine-readable error code strings
│   │   ├── cache-keys.ts         # Redis key templates
│   │   └── business.ts           # FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE, etc.
│   │
│   ├── app.ts                    # Express app setup (middleware chain)
│   └── server.ts                 # HTTP server + graceful shutdown
│
├── prisma/
│   ├── schema.prisma             # All models
│   ├── migrations/               # Auto-generated by prisma migrate
│   └── seed.ts                   # Seed script (categories, collections, 12 products)
│
├── tests/
│   ├── unit/
│   │   ├── auth/
│   │   ├── products/
│   │   └── orders/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── products.test.ts
│   │   └── orders.test.ts
│   └── setup.ts                  # Test DB, test JWT secrets
│
├── docs/
│   └── swagger.yaml              # OpenAPI 3.0 spec (auto-generated via tsoa or hand-written)
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml        # postgres + redis + api
│
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.ts
```

### Tech Stack Summary

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Runtime     | Node.js 20 LTS                   |
| Framework   | Express.js                       |
| Language    | TypeScript 5                     |
| Database    | PostgreSQL 16                    |
| ORM         | Prisma 5                         |
| Cache       | Redis 7                          |
| Auth        | JWT (jsonwebtoken) + bcrypt      |
| Validation  | Zod 4                            |
| File Upload | Multer + Cloudinary SDK          |
| Email       | Nodemailer (SMTP) or Resend API  |
| Queue       | BullMQ + Redis                   |
| Logging     | Pino + pino-pretty               |
| Testing     | Jest + Supertest                 |
| API Docs    | Swagger / OpenAPI 3.0            |
| Container   | Docker + docker-compose          |
| Security    | Helmet, cors, express-rate-limit |

---

## Verification

Once the backend is built, verify against this spec:

1. **Auth flow:** Sign up → sign in → GET /auth/me → refresh → sign out → verify token revoked
2. **Product browsing:** GET /products (paginated) → GET /products/search?q=oud → GET /products/:id → GET /products/:id/reviews
3. **Wishlist:** Authenticate → POST /wishlist → GET /wishlist → DELETE /wishlist/:id → GET /wishlist (empty)
4. **Order flow:** POST /orders (guest) → GET /orders (guest reference) → admin PATCH status → check notification created
5. **Admin:** Admin sign in → GET /admin/dashboard → POST /admin/products → PATCH /admin/orders/:id/status
6. **Rate limiting:** Exceed POST /auth/sign-in limit → verify 429 response
7. **Error handling:** Invalid UUID → 400; missing auth → 401; wrong role → 403; missing resource → 404
8. **Caching:** GET /categories twice → verify Redis hit on second request (log cache HIT)
9. **Search:** GET /products/search?q=oud → verify full-text index used (EXPLAIN ANALYZE)
10. **Image upload:** POST /admin/upload (multipart JPEG) → verify Cloudinary URL returned
