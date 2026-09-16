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
- `GET /api/account/cart`
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
