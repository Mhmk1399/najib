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
color, size, currency, and price are resolved again on the server; clients cannot
submit or override prices. Adding the same variant increases its quantity up to
99, quantity changes refresh the server price, and only the active cart owned by
the authenticated customer can be changed. Adding to a cart does not reserve
stock; exact stock is reserved by the checkout orchestration step.

`POST /api/account/checkouts` accepts an idempotency key plus an active `storeId`
and matching `cityId`. In one MongoDB transaction it reprices every cart item,
validates product/color/size sellability, allocates the exact variants across
active store locations, creates a 15-minute inventory reservation, marks the cart
as `checkout_started`, and writes an outbox event. Repeating the same request key
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

List routes support validated pagination, search, status, store, city, and user
filters appropriate to their resource. Order writes expose explicit actions
instead of arbitrary status updates, preventing Admin clients from inventing a
successful payment, inventory reservation, confirmation, or refund.

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
