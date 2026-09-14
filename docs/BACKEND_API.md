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

## Private administration

The existing `/api/catalog/:resource` routes are for authenticated dashboard use.
Private responses are never cached. Writes are validated before Mongoose executes
them and permissions are checked by the route handler.

## Operations

`GET /api/health` verifies that the Node application can ping MongoDB. It is never
cached and includes a `Server-Timing` header. Public API responses include the same
timing header to support measurements without adding timing fields to response data.

Run the application and backend checks with:

```bash
npm run dev
npm run test:api
```
