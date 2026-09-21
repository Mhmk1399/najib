# API Implementation Status

This file is the source of truth for backend delivery order. Update it whenever
an API task is completed or its contract changes.

## Quality gate

- Next.js is pinned to `16.3.5`; the dependency audit currently reports zero
  known vulnerabilities.
- Production requires Node.js `20.19.0` or newer and an explicit
  `AUTH_ACCESS_TOKEN_SECRET`.
- `npm run typecheck`, `npm run lint`, `npm run build`, and
  `npm run test:api` must pass before a delivery batch is marked complete.
- Admin order, cart, and abandoned-checkout mutations write their domain
  change and audit/outbox records in one MongoDB transaction.
- Inventory adjustment, reservation, commit/release/expire, and transfer
  operations are transactional and protected by idempotency keys.

## Delivery order

1. Admin dashboard APIs required to operate existing data.
2. Customer/storefront commerce APIs.
3. Inventory and exact-variant availability APIs.
4. Checkout orchestration and payment APIs.
5. Activity, recommendations, policy, and integration APIs.

## Admin APIs

This table tracks backend routes and notes their Admin UI state. The current
Admin UI exposes dashboard, users, catalog, categories, references, images,
the Persian Inventory control center, and the operational Orders console.
Operational pages for carts, checkout sessions, abandoned checkouts, and audit history still need to be
added to the Admin navigation and interface.

| Area | Routes | Status |
| --- | --- | --- |
| Authentication | `/api/auth/login`, `/signup`, `/me`, `/refresh`, `/logout` | Complete |
| Dashboard summary | `/api/admin/dashboard-summary` | Complete; includes catalog, users, orders, active carts/checkouts, abandoned checkout attention, and confirmed revenue |
| Users and roles | `/api/admin/users`, `/api/admin/users/:id` | Complete |
| Catalog | `/api/catalog/:resource`, `/api/catalog/:resource/:id` | Complete for categories, subcategories, products, variants, colors, sizes, size groups, collections, and images |
| Uploads | `/api/admin/uploads/avatar`, `/api/admin/uploads/catalog-image` | Complete |
| Orders | `/api/admin/orders`, `/api/admin/orders/:id`, `/admin/orders` | Complete for Persian operational list/detail UI and safe cancel, payment-retry, and fulfillment transitions |
| Carts | `/api/admin/carts`, `/api/admin/carts/:id` | Complete for list/detail and safe abandon/expire transitions |
| Checkout sessions | `/api/admin/checkouts`, `/api/admin/checkouts/:id` | Complete, read-only operational view |
| Abandoned checkouts | `/api/admin/abandoned-checkouts`, `/api/admin/abandoned-checkouts/:id` | Complete for list/detail and recovery workflow status |
| Audit history | `/api/admin/audit` | Complete |
| Inventory | `/api/admin/inventory/*`, `/admin/inventory` | Complete for Persian Admin UI, cities, stores, pools, locations, balances, movement ledger, adjustments, transfers, and reservation lifecycle |
| Payments | Intents, attempts, captures, refunds, reconciliation | After inventory contracts |
| Policies | Draft/version/approval/evaluation history | Pending |
| AI reports | Recommendation and tool-use reports | Pending |
| Integrations | Accounting/CRM delivery status and retry controls | Pending |

## Customer account APIs

| Area | Routes | Status |
| --- | --- | --- |
| Protected dashboard | `/customer-dashboard` | Complete; server-verified customer session with staff redirect to Admin |
| Account summary | `GET /api/account/summary` | Complete; safe profile, real order totals, spending, active cart, address count, and recent orders |
| Customer orders | `GET /api/account/orders`, `GET /api/account/orders/:id` | Complete; validated filters/pagination and ownership enforced in database queries |
| Current cart | `GET/DELETE /api/account/cart`, `POST /api/account/cart/items`, `PATCH/DELETE /api/account/cart/items/:id` | Complete for customer-owned read, add, quantity update, item removal, and clear operations; sellability and server-side prices are revalidated on every write |
| Checkout destinations | `GET /api/storefront/checkout-destinations` | Complete; returns only active localized cities and stores backed by active inventory locations, without warehouse or stock details |
| Checkout reservation | `POST /api/account/checkouts`, `GET/PATCH /api/account/checkouts/:id` | Complete for customer-owned start/read/cancel: reprices the cart, validates destination, reserves exact variants transactionally for 15 minutes, prevents duplicate reservation with an idempotency key, and releases stock on cancel |
| Temporary payment | `POST /api/account/checkouts/:id/payment-intents`, `GET /api/account/payments/:id`, `POST /api/account/payments/:id/confirm` | Complete with development-only mock providers: failed attempts remain retryable; verified success atomically commits inventory, creates the order, completes checkout, converts the cart, and requests confirmation SMS |
| Customer profile | `GET/PATCH /api/account/profile` | Complete; full saved-address read and strict whitelist for editable profile fields |

All customer account responses are private and use `Cache-Control: no-store`.
Anonymous sessions receive `401`; staff sessions receive `403`. Customer order
and cart queries always derive `userId` from the verified database session, never
from request parameters. API tests create isolated customer, order, cart, and
foreign-order fixtures and remove them after ownership and whitelist checks.

## Safety rules for the current admin operations

- Every route verifies the database-backed session and the exact permission.
- Admin responses use `Cache-Control: no-store`.
- Orders cannot be arbitrarily changed to paid, confirmed, or refunded.
- `cancel` is limited to orders that have not been confirmed.
- `mark_fulfilled` is limited to confirmed orders.
- `retry_payment` is limited to failed-payment orders.
- Operational mutations create audit records. Order changes also create outbox
  events for later asynchronous processing.
- Recovered abandoned checkouts are system-owned; Admin can only mark contacted,
  suppressed, or expired.

## Inventory contracts

- Balances use one unique row per exact `variantId + locationId`.
- Availability is calculated as `onHand - reserved - safetyStock` and never
  exposed as a negative value.
- Public availability returns only the aggregate sellable quantity; internal
  warehouse details stay behind `inventory.read`.
- Master records use localized `fa`, `en`, and `ar` names. The Admin interface
  itself remains Persian-only.
- Related documents are populated only when `include=references` is requested,
  keeping normal list calls small.
- Every stock mutation writes an immutable movement ledger record. Transfers
  write matching source and destination movements in the same transaction.
- Duplicate mutation requests with the same idempotency key do not apply stock
  twice.

## Next implementation batch

Before starting a new domain, keep `npm run typecheck`, `npm run lint`,
`npm run build`, and `npm run test:api` green. Production also requires an
explicit `AUTH_ACCESS_TOKEN_SECRET` of at least 32 bytes.

The Inventory backend contract, customer cart/checkout flow, temporary
development Payment/SMS adapters, and storefront Cart/Checkout interface are
complete. Storefront products resolve an exact active color/size variant before
calling the Cart API; the real Cart supports quantity/removal/clear actions and
Checkout exposes destination selection, the 15-minute reservation countdown,
cancel, mock payment outcomes, and order confirmation. The next batch is:

1. Replace the temporary adapters when Payment and SMS provider credentials and
   callback contracts are available.
2. Add capture, refund, and reconciliation APIs after the real gateway is chosen.
3. Configure the scheduler to call `POST /api/internal/jobs/expire-checkouts`
   with `Authorization: Bearer $CRON_SECRET`; the idempotent expiry worker,
   inventory release, cart abandonment, payment cancellation, and abandoned
   checkout snapshot are implemented.
4. Add the remaining operational Admin pages for carts, checkout sessions,
   abandoned checkouts, and audit history; Orders UI is complete.

Payment intent and refund APIs follow only after reservation contracts exist, so
the system cannot report a paid order without controlling exact-variant stock.
