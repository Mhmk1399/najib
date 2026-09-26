# Backend API

The backend runs inside the primary Next.js application on the Node.js runtime.
Route handlers live under `app/api`; MongoDB models live under `models`; reusable
server-only query and authentication code lives under `lib/server` and `services`.
There are no separate application servers in this active path.

## Public catalog

- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/categories/:slug`
- `GET /api/v1/catalog/products?limit=20&cursor=...`
- `GET /api/v1/catalog/products/:slug`

Product lists use cursor pagination and do not calculate a total document count.
List responses select only product-card fields; detail responses return the full
record. Public successful reads use `s-maxage=60` and `stale-while-revalidate=300`.
All localized customer-facing fields retain `fa`, `en`, and `ar` values.

Optional product filters:

- `category`: category slug
- `collection`: collection slug
- `q`: full-text search, 2 to 80 characters
- `limit`: 1 to 50
- `cursor`: the `nextCursor` returned by the previous response

## Private customer account

The customer workspace at `/customer-dashboard` uses these protected endpoints:

- `GET /api/account/summary`
- `GET /api/account/orders?page=1&limit=10&status=confirmed`
- `GET /api/account/orders/:id`
- `GET|DELETE /api/account/cart`
- `POST /api/account/cart/items`
- `PATCH|DELETE /api/account/cart/items/:id`
- `POST /api/account/checkouts`
- `GET|PATCH /api/account/checkouts/:id`
- `POST /api/account/checkouts/:id/payment-intents`
- `GET /api/account/payments/:id`
- `POST /api/account/payments/:id/confirm`
- `GET|PATCH /api/account/profile`

The customer-safe destination selector is public so the Checkout UI can prepare
its city/store choices without exposing operational inventory data:

- `GET /api/storefront/checkout-destinations`

It returns localized active cities and stores only when an active inventory
location backs the store. It never returns location IDs, balances, reserved
quantities, warehouse names, or safety stock.

These routes accept only an active, database-backed customer session and always
return `Cache-Control: no-store`. Anonymous callers receive `401`, while staff
accounts receive `403` and use the Admin APIs instead. Order detail ownership is
part of the MongoDB query (`_id` and the session account's `userId`), so a foreign
order is returned as `404` without revealing whether it exists.

Customer order responses contain display-safe status, totals, timestamps, and
immutable item snapshots. Localized snapshot names resolve Persian first, then
English or Arabic. Internal correlation, idempotency, payment, inventory, policy,
and audit fields are not exposed.

Cart writes accept only an exact `variantId` and quantity. Product status, variant,
color, size, and price are resolved again on the server; clients cannot submit or
override prices. The catalog has one canonical currency (`IRR`): legacy product
currency labels never split or reject a cart, and all current cart/checkout prices
are snapshotted as IRR without pretending to perform FX conversion. Adding the same variant increases its quantity up to
99, quantity changes refresh the server price, and only the active cart owned by
the authenticated customer can be changed. Adding to a cart does not reserve
stock; exact stock is reserved by the checkout orchestration step.
Cart reads include the product's active primary image metadata and, while a cart
is in `checkout_started`, safe resumable Checkout metadata (`id`, status, expiry,
and payment ID). Checkout reads expose their payment ID for the same resume flow.

Authenticated `GET /api/account/checkouts` computes a deterministic delivery plan
for the current Cart. It may allocate exact quantities across multiple branches,
prefers the fewest shipments, then the lowest configured shipping total, and
returns only the branches and line allocations actually used. Each used branch
contributes its configured shipping fee once.

`POST /api/account/checkouts` accepts an idempotency key and the confirmed
`fulfillmentPlanHash`. In one MongoDB transaction it reprices every cart item,
recomputes the plan, rejects a stale hash, reserves every exact location allocation,
marks the cart as `checkout_started`, and writes an outbox event. Repeating the same request key
returns the original checkout without reserving stock twice. `PATCH` currently
accepts `{ "action": "cancel" }`; it releases the reservation and reopens the cart.
The temporary Payment provider supports successful and failed attempts without
allowing client-supplied amounts. A successful confirmation commits the inventory
reservation, creates an immutable order snapshot, completes Checkout, converts the
cart, and requests an order-confirmation SMS in the same domain flow. Failed
attempts remain retryable while the reservation is active.

Development uses deterministic `mock` Payment and SMS adapters when no provider is
configured. They do not make external calls and are idempotent by request key. For
explicit local configuration use `PAYMENT_PROVIDER=mock` and `SMS_PROVIDER=mock`.
Production never falls back to these adapters: until real providers are configured,
the corresponding operation returns `503` instead of reporting a fake payment or
message as successful.

`PATCH /api/account/profile` accepts only `firstName`, `lastName`, `phone`, and
`preferredLocale`. Email, roles, permissions, account status, credentials, and
store access are rejected by strict validation. Saved addresses are returned by
the profile endpoint but remain read-only in this iteration.

## Private administration

The existing `/api/catalog/:resource` routes are for authenticated dashboard use.
Private responses are never cached. Writes are validated before Mongoose executes
them and permissions are checked by the route handler.

Operational Admin routes are also available:

- `GET /api/admin/orders`
- `GET|PATCH /api/admin/orders/:id`
- `GET /api/admin/carts`
- `GET|PATCH /api/admin/carts/:id`
- `GET /api/admin/checkouts`
- `GET /api/admin/checkouts/:id`
- `GET /api/admin/abandoned-checkouts`
- `GET|PATCH /api/admin/abandoned-checkouts/:id`
- `POST /api/admin/abandoned-checkouts/:id/recovery-link`

### Unified product creation

`POST /api/admin/catalog/products/complete` requires both `catalog.write` and
`inventory.write`. It accepts one strict request containing the localized product,
enabled color-size variants, and optional initial stock rows. Product, variants,
positive balances, immutable adjustment movements, audit evidence, and the
idempotency result are created in one MongoDB transaction. The server assigns the
canonical IRR currency; the Admin composer never asks an operator to choose a
catalog currency. The same idempotency key and body replays the original result;
reusing the key for a different body returns `409`.

Recovery-link rotation requires `orders.write`, an authenticated-customer
abandoned record, and an operational reason. It returns the raw seven-day link
once for manual delivery; only its SHA-256 hash is stored. No SMS or email is
sent by this operation.

Customer recovery routes:

- `GET /api/account/abandoned-checkouts/recovery?token=...`
- `POST /api/account/abandoned-checkouts/recovery`
- `/{locale}/recover-checkout?token=...`

Both API methods require the exact owning customer session. Preview evaluates
current product/variant/color/size activity, server price, currency, and
sellable stock at the original store/city. Restore transactionally merges
available quantities into the active cart without deleting existing lines and
is idempotent for the same valid link. Source attribution continues onto the
next checkout. The abandoned record changes to `recovered` only in the same
transaction that a successful payment creates its order.
- `GET /api/admin/audit`

Inventory Admin routes require `inventory.read` or `inventory.write`:

- `GET|POST /api/admin/inventory/cities`
- `GET|PATCH /api/admin/inventory/cities/:id`
- The same list/create/detail/update contract for `stores`, `pools`, and
  `locations`
- `GET /api/admin/inventory/balances`
- `GET /api/admin/inventory/movements`
- `POST /api/admin/inventory/adjustments`
- `GET|POST /api/admin/inventory/reservations`
- `GET|PATCH /api/admin/inventory/reservations/:id`
- `GET|POST /api/admin/inventory/transfers`

Inventory lists accept `page`, `limit`, and resource-specific filters. Add
`include=references` only when the caller needs related city, store, pool,
location, or variant data. The default responses keep references as IDs for a
smaller and faster payload.

`POST /adjustments`, `/reservations`, and `/transfers` require an idempotency
key. Reservation actions are explicit: `commit`, `release`, or `expire`.
Balances cannot be written directly; every change goes through a transactional
operation and creates an immutable movement record.

The storefront can read aggregate exact-variant stock without seeing internal
warehouse data:

- `GET /api/storefront/inventory/availability?variantId=:id`
- Optional filters: `storeId` and `cityId`

The response is `{ variantId, available, inStock }` and uses `no-store` because
availability changes during checkout.

### Split-store checkout fulfillment

`GET /api/account/checkouts` returns the current cart's computed delivery plan:
`shipments[]`, `shipmentCount`, `shippingMinor`, `subtotalMinor`, `totalMinor`,
and `fulfillmentPlanHash`. Every shipment contains only its source branch and
the exact variant/location quantities assigned to it. The planner first minimizes
shipment count, then configured delivery fees, with stable branch ordering.

Create the reservation with `POST /api/account/checkouts` and send
`{ idempotencyKey, fulfillmentPlanHash }`. The service recomputes inside the
MongoDB transaction. A changed plan returns `409`; no partial checkout is saved.
One inventory reservation contains all cross-branch allocations. Checkout and
Order persist shipment snapshots, while payment amount is items plus the sum of
the per-shipment fees.

List routes support validated pagination, search, status, store, city, and user
filters appropriate to their resource. Order writes expose explicit actions
instead of arbitrary status updates, preventing Admin clients from inventing a
successful payment, inventory reservation, confirmation, or refund.

Expired checkout cleanup is exposed as an idempotent internal job:

- `POST /api/internal/jobs/expire-checkouts`
- Header: `Authorization: Bearer $CRON_SECRET`

Each run claims at most 50 due checkout sessions, expires and releases their
inventory reservations transactionally, cancels unfinished payment intents,
marks the cart abandoned, stores a localized abandoned-checkout snapshot, and
writes a `CheckoutExpired` outbox event. Configure the deployment scheduler to
call it once per minute. Repeated calls cannot release the same reservation
twice.

See `docs/API_IMPLEMENTATION_STATUS.md` for the current completion matrix and
the delivery order for Inventory, Payment, Policy, AI, and integrations.

## Operations

`GET /api/health` verifies that the Node application can ping MongoDB. It is never
cached and includes a `Server-Timing` header. Public API responses include the same
timing header to support measurements without adding timing fields to response data.

Run the application and backend checks with:

```bash
npm run dev
npm run test:api
```
# Dual pricing and product stock batches

- Products keep explicit `priceIrrMinor` (whole rials) and `priceUsdMinor` (cents). Variant overrides use `priceOverrideIrrMinor` and `priceOverrideUsdMinor`; a missing override falls back to its product price.
- `PATCH /api/account/cart` with `{ "currency": "IRR" | "USD" }` reprices the same active cart. There is no exchange-rate conversion and currency never partitions the cart.
- Checkout preview `GET /api/account/checkouts?currency=USD` and checkout start both use the selected currency. The fulfillment hash contains that currency, exact line prices, allocations and shipping fees.
- Stores keep independent `shippingFeeIrrMinor` and `shippingFeeUsdMinor`. Each used store is one shipment and contributes its selected-currency fee once.
- `GET /api/admin/inventory/product-stock?productId=...&locationId=...` returns active variants and their balances for the compact stock form.
- `POST /api/admin/inventory/product-stock` atomically adds positive quantities for several variants of one product at one active location. Body: `{ idempotencyKey, productId, locationId, items: [{ variantId, quantity }] }`. It requires both catalog and inventory write permissions.
