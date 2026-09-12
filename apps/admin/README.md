# Najib Admin

The admin application is the protected operational workspace for the Najibzadeh commerce platform. It includes staff sign-in, server-verified sessions, permission-aware navigation, the responsive application shell, overview dashboard, real product catalog management, theme support, global search, and server-side service health checks.

## Commands

Run from the repository root:

```bash
pnpm dev:admin
pnpm dev:admin-stack
pnpm build:admin
pnpm typecheck:admin
pnpm lint:admin
pnpm test:admin-catalog-flow
pnpm test:admin-content-flow
```

Seed a reusable local demo catalog through the authenticated Admin API:

```bash
SEED_ADMIN_PASSWORD='your-local-admin-password' pnpm seed:admin-demo
```

The seed is idempotent: running it again updates the same `demo-` records
instead of creating duplicates. Its image URLs use the local storefront at
`http://localhost:3000` by default; override `SEED_ASSET_BASE_URL` when needed.

The development server uses `http://localhost:3001`.

The staff interface is Persian-only and RTL. Catalog editors store
customer-facing copy in Persian, English, and Arabic; see
`../../docs/CATALOG_LOCALIZATION.md` for the API contract and migration rules.

For normal local Admin work, use `pnpm dev:admin-stack`. It keeps the Admin,
Commerce API, and Customer Data authentication API together in one terminal.
Use `pnpm dev:admin` only when those backend services are already running.

Create the first staff account before signing in. Choose your own credentials;
the project intentionally has no default administrator password:

```bash
STAFF_EMAIL=owner@example.com \
STAFF_PASSWORD='choose-a-long-unique-password' \
STAFF_FIRST_NAME=Store \
STAFF_LAST_NAME=Owner \
STAFF_ROLES=owner \
npm run staff:create
```

## Service URLs

Health checks run only on the server and use these optional environment variables:

```bash
COMMERCE_API_URL=http://127.0.0.1:4001/api/v1
INVENTORY_API_URL=http://127.0.0.1:4002/api/v1
PAYMENT_API_URL=http://127.0.0.1:4003/api/v1
CUSTOMER_DATA_API_URL=http://127.0.0.1:4004/api/v1
AUTH_ACCESS_TOKEN_SECRET=replace-with-at-least-32-random-bytes
```

The local ports above are the built-in defaults. If a service is stopped or unavailable, the dashboard degrades safely and shows `Unavailable`.

## Current data boundary

KPI totals, charts, orders, inventory warnings, and activity entries are intentional demo data from `lib/demo-data.ts`. The dashboard labels this clearly. Service status is read live from the existing backend health endpoints.

Staff authentication, rotating sessions, role-based navigation, the protected
product ledger, Page Composer, Image Stories, and Commerce catalog writes are
active. These tools use real categories, subcategories, collections, products,
variants, and image records and never insert demo catalog data. Image Stories
currently manages URL-based image metadata; binary upload and media storage are
not part of this phase. Product variant management, inventory, and aggregate
reporting remain later phases. See `docs/STAFF_AUTHORIZATION.md` for the
permission matrix and production requirements.
