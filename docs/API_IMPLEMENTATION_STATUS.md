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
the Persian Inventory control center, and the complete operational commerce console.
Operational pages for Orders, carts, checkout sessions, abandoned checkouts, and audit history are
added to the Admin navigation and interface.

| Area | Routes | Status |
| --- | --- | --- |
| Authentication | `/api/auth/login`, `/signup`, `/me`, `/refresh`, `/logout` | Complete |
| Dashboard summary | `/api/admin/dashboard-summary` | Complete; includes catalog, users, orders, active carts/checkouts, abandoned checkout attention, and confirmed revenue |
| Users and roles | `/api/admin/users`, `/api/admin/users/:id` | Complete |
| Catalog | `/api/catalog/:resource`, `/api/catalog/:resource/:id` | Complete for categories, subcategories, products, variants, colors, sizes, size groups, collections, and images |
| Uploads | `/api/admin/uploads/avatar`, `/api/admin/uploads/catalog-image` | Complete |
| Orders | `/api/admin/orders`, `/api/admin/orders/:id`, `/admin/orders` | Complete for Persian operational list/detail UI and safe cancel, payment-retry, and fulfillment transitions |
| Carts | `/api/admin/carts`, `/api/admin/carts/:id`, `/admin/carts` | Complete for Persian list/detail UI and safe abandon/expire transitions |
| Checkout sessions | `/api/admin/checkouts`, `/api/admin/checkouts/:id`, `/admin/checkouts` | Complete, read-only Persian operational view |
| Abandoned checkouts | `/api/admin/abandoned-checkouts`, `/api/admin/abandoned-checkouts/:id`, `POST /api/admin/abandoned-checkouts/:id/recovery-link`, `/admin/abandoned-checkouts` | Complete; Persian operations UI can rotate a seven-day secure link for an authenticated customer and copy it for manual delivery. No SMS/email is implied or sent |
| Audit history | `/api/admin/audit`, `/admin/audit` | Complete, immutable Persian timeline/detail UI with operational filters |
| Inventory | `/api/admin/inventory/*`, `/admin/inventory` | Complete for Persian Admin UI, cities, stores, pools, locations, balances, movement ledger, adjustments, transfers, and reservation lifecycle |
| Payments | Intents, attempts, captures, refunds, reconciliation | After inventory contracts |
| Policies | Draft/version/approval/evaluation history | Pending |
| AI reports | Recommendation and tool-use reports | Pending |
| Integrations | Accounting/CRM delivery status and retry controls | Pending |

## Customer account APIs

| Area | Routes | Status |
| --- | --- | --- |
| Protected dashboard | `/customer-dashboard`, `/fa/customer-dashboard` | Complete; unlocalized entry is normalized to the Persian route, then the server-verified customer session redirects staff to Admin and anonymous users to localized login |
| Account summary | `GET /api/account/summary` | Complete; safe profile, real order totals, spending, active cart, address count, and recent orders |
| Customer orders | `GET /api/account/orders`, `GET /api/account/orders/:id` | Complete; validated filters/pagination and ownership enforced in database queries |
| Current cart | `GET/DELETE /api/account/cart`, `POST /api/account/cart/items`, `PATCH/DELETE /api/account/cart/items/:id`, `/{locale}/cart` | Complete in `fa`, `en`, and `ar`: customer-owned read and mutations, localized product/color/size/image data, native UI copy/direction/formatting/routes, and server-side sellability and price revalidation on every write; invalid locale queries return `400` and omitted locale defaults to `fa` |
| Unified product composer | `POST /api/admin/catalog/products/complete`, `/admin/catalog/products` | Complete: one Persian flow creates a localized product, exact color-size variants, deterministic SKUs and initial stock per active branch/warehouse. The atomic transaction writes balances, movement ledger, audit and idempotency evidence. Catalog currency is fixed to IRR and is no longer an operator field. |
| Checkout destinations | `GET /api/storefront/checkout-destinations` | Complete; returns only active localized cities and stores backed by active inventory locations, without warehouse or stock details |
| Checkout reservation | `GET/POST /api/account/checkouts`, `GET/PATCH /api/account/checkouts/:id`, `/{locale}/checkout` | Complete: Cart-aware GET computes a deterministic multi-shipment plan across active branches, preferring the fewest shipments and then lower configured delivery cost. Exact variant quantities may split across branches. The fa/en/ar modal shows only branches used by the plan, their allocated lines, and a separate fee per shipment. POST verifies the plan hash and atomically reserves every allocation for 15 minutes; stale plans return `409` and require confirmation again. |
| Temporary payment | `POST /api/account/checkouts/:id/payment-intents`, `GET /api/account/payments/:id`, `POST /api/account/payments/:id/confirm` | Complete with development-only mock providers: failed attempts remain retryable; verified success atomically commits inventory, creates the order, completes checkout, converts the cart, and requests confirmation SMS |
| Abandoned checkout recovery | `GET/POST /api/account/abandoned-checkouts/recovery`, `/{locale}/recover-checkout` | Complete for authenticated owners in `fa`, `en`, and `ar`: secure-token preview, live repricing and exact-store availability, unavailable-item explanations, transactional merge into the active cart, idempotent retry, and source attribution through checkout/order conversion |
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
  suppressed, or expired. Creating or rotating a recovery link requires
  `orders.write`, a Persian reason, an authenticated-customer record, and writes
  immutable audit/outbox evidence. Raw recovery tokens are never persisted.
- Opening or restoring a recovery link is not a conversion. Only successful
  payment and order creation atomically set the abandoned record to `recovered`;
  failed payment leaves it eligible.

## Inventory contracts

- Balances use one unique row per exact `variantId + locationId`.
- Availability is calculated as `onHand - reserved - safetyStock` and never
  exposed as a negative value.
- Public availability returns only the aggregate sellable quantity; internal
  warehouse details stay behind `inventory.read`.
- Master records use localized `fa`, `en`, and `ar` names. The Admin interface
  itself remains Persian-only.
- Each store has an explicit nonnegative `shippingFeeMinor` (zero by default for
  existing records), editable in Persian Inventory Admin. Checkout snapshots the
  fee per shipment; payment and the final order use the summed snapshot exactly once.
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

The Inventory backend contract, customer cart/checkout flow, authenticated
abandoned-checkout recovery, temporary
development Payment/SMS adapters, and storefront Cart/Checkout interface are
complete. Storefront products resolve an exact active color/size variant before
calling the Cart API; the real Cart supports quantity/removal/clear actions and
Checkout exposes an automatic split-delivery plan, the 15-minute reservation countdown,
cancel, mock payment outcomes, and order confirmation. The next batch is:

1. Replace the temporary adapters when Payment and SMS provider credentials and
   callback contracts are available.
2. Add capture, refund, and reconciliation APIs after the real gateway is chosen.
3. Configure the scheduler to call `POST /api/internal/jobs/expire-checkouts`
   with `Authorization: Bearer $CRON_SECRET`; the idempotent expiry worker,
   inventory release, cart abandonment, payment cancellation, and abandoned
   checkout snapshot are implemented.

Payment intent and refund APIs follow only after reservation contracts exist, so
the system cannot report a paid order without controlling exact-variant stock.
# Latest commerce workflow

- [x] Explicit IRR and USD product prices with independent variant overrides and legacy read fallback
- [x] Single cart with checkout-time IRR/USD repricing
- [x] Explicit dual shipping fees per store and fee-per-used-shipment calculation
- [x] Atomic idempotent batch stock entry directly from a Products row
