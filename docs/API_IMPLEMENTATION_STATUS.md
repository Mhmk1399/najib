# API Implementation Status

This file is the source of truth for backend delivery order. Update it whenever
an API task is completed or its contract changes.

## Delivery order

1. Admin dashboard APIs required to operate existing data.
2. Customer/storefront commerce APIs.
3. Inventory and exact-variant availability APIs.
4. Checkout orchestration and payment APIs.
5. Activity, recommendations, policy, and integration APIs.

## Admin APIs

| Area | Routes | Status |
| --- | --- | --- |
| Authentication | `/api/auth/login`, `/signup`, `/me`, `/refresh`, `/logout` | Complete |
| Dashboard summary | `/api/admin/dashboard-summary` | Complete; includes catalog, users, orders, active carts/checkouts, abandoned checkout attention, and confirmed revenue |
| Users and roles | `/api/admin/users`, `/api/admin/users/:id` | Complete |
| Catalog | `/api/catalog/:resource`, `/api/catalog/:resource/:id` | Complete for categories, subcategories, products, variants, colors, sizes, size groups, collections, and images |
| Uploads | `/api/admin/uploads/avatar`, `/api/admin/uploads/catalog-image` | Complete |
| Orders | `/api/admin/orders`, `/api/admin/orders/:id` | Complete for list/detail and safe cancel, payment-retry, and fulfillment transitions |
| Carts | `/api/admin/carts`, `/api/admin/carts/:id` | Complete for list/detail and safe abandon/expire transitions |
| Checkout sessions | `/api/admin/checkouts`, `/api/admin/checkouts/:id` | Complete, read-only operational view |
| Abandoned checkouts | `/api/admin/abandoned-checkouts`, `/api/admin/abandoned-checkouts/:id` | Complete for list/detail and recovery workflow status |
| Audit history | `/api/admin/audit` | Complete |
| Inventory | Cities, stores, locations, balances, movements, adjustments, transfers, reservations | Next admin API phase |
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
| Current cart | `GET /api/account/cart` | Complete; customer-owned active cart with resilient catalog labels |
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

## Next implementation batch

The next batch must add the Inventory domain before payment/checkout completion:

1. City, store, inventory pool, and location models.
2. Exact `variantId + locationId` balances.
3. Availability read API.
4. Idempotent reserve, commit, release, and expire operations.
5. Admin adjustments, movements, and transfers.
6. Inventory cards and alerts in the Admin dashboard.

Payment intent and refund APIs follow only after reservation contracts exist, so
the system cannot report a paid order without controlling exact-variant stock.
