# Najib Admin

The admin application is the protected operational workspace for the Najibzadeh commerce platform. It includes staff sign-in, server-verified sessions, permission-aware navigation, the responsive application shell, overview dashboard, theme support, global search, demo commerce data, and server-side service health checks.

## Commands

Run from the repository root:

```bash
pnpm dev:admin
pnpm build:admin
pnpm typecheck:admin
pnpm lint:admin
```

The development server uses `http://localhost:3001`.

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

Staff authentication, rotating sessions, role-based navigation, and protected Commerce catalog writes are active. Aggregate reporting endpoints and Admin mutation screens remain later phases. See `docs/STAFF_AUTHORIZATION.md` for the permission matrix and production requirements.
