# Najib Admin

An independent Next.js operations application for the Najibzadeh commerce platform. This foundation includes the responsive shell, overview dashboard, dark mode, global search interaction, demo metrics, and server-side service health checks.

## Commands

From the repository root:

```bash
pnpm dev:admin
pnpm build:admin
pnpm typecheck:admin
pnpm lint:admin
```

The development server runs at `http://localhost:3001`.

## Service health environment

The dashboard reads health status on the server. All variables are optional and fall back to local development ports:

- `COMMERCE_API_URL` (`http://127.0.0.1:4001`)
- `INVENTORY_API_URL` (`http://127.0.0.1:4002`)
- `PAYMENT_API_URL` (`http://127.0.0.1:4003`)
- `CUSTOMER_DATA_API_URL` (`http://127.0.0.1:4004`)

Base URLs never reach browser code. Unreachable services are shown as unavailable after a short timeout.

## Current boundary

The KPI, chart, order, stock, and activity content is deliberately marked as demo data. Aggregate admin endpoints, authentication, staff sessions, RBAC, and write operations are future phases. Navigation stays within the shell so unfinished areas never lead to broken routes.
