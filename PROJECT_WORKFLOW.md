# Najib Commerce Platform: Workflow and Project Rules

This document is the project source of truth. It records what we are building,
how work should proceed, what is complete, and what remains. Update it after
every finished task.

## Product Goal

Build a boutique commerce platform with a customer storefront, an admin
dashboard, catalog and checkout, exact city-specific inventory, payments,
customer history, abandoned checkout recovery, AI recommendations, business
policies, and accounting integrations.

## Working Method

For every task:

1. Agree on the requirement and important model decisions.
2. Inspect existing code before changing it.
3. Make one small, reviewable implementation.
4. Add or update automated tests.
5. Run type checks, relevant lint checks, tests, and builds.
6. Fix failures caused by the task.
7. Update this document with the result and next step.

## Project Rules

- Use one Git repository and pnpm workspace.
- Use TypeScript for application source code.
- Use Node.js, NestJS, and Fastify for backend APIs.
- Use MongoDB with Mongoose. PostgreSQL and Prisma are not used.
- Commerce, Inventory, Payment, and Customer Data own separate logical
  databases and models.
- A service must never import or directly write another service's models.
- Cross-service IDs are plain external references without database joins.
- Product variants represent an exact Product + Color + Size combination.
- Cart and order items always reference the exact variant.
- Prices use integer minor currency units, never floating-point money.
- Inventory is tracked by exact variant and exact location.
- Inventory cannot become negative or reserve unavailable stock.
- Critical commands require idempotency keys.
- The browser never confirms payment success; verified server responses or
  payment-provider webhooks do.
- Customer history is stored as activity events, not an unlimited array inside
  the User document.
- Personalization and marketing must respect recorded customer consent.
- Secrets must use server-only environment variables. Never use `NEXT_PUBLIC_`
  for database credentials.
- Docker, Redis, and RabbitMQ are optional during the current development
  phase. They can be introduced later by a DevOps engineer.
- Preserve the existing storefront unless a task explicitly changes it.
- Do not report a task as complete while its relevant validation is failing.

## Current Runtime Workflow

The current development workflow does not require Docker:

```text
Next.js storefront
        |
        +--> Commerce API ------> najib_commerce MongoDB database
        |
        +--> Inventory API -----> najib_inventory MongoDB database
```

Start the storefront and APIs in separate terminals:

```bash
pnpm dev
pnpm dev:commerce
pnpm dev:inventory
```

Run backend API checks:

```bash
pnpm test:apis
```

## Service Ownership

### Commerce

- Category and Subcategory page content
- Collections
- Products, variants, colors, sizes, and image assets
- Shoppable editorial-image product links
- Carts and checkout sessions
- Orders and abandoned checkouts

### Inventory

- Cities and stores
- Store-to-inventory-pool bindings
- Inventory pools and locations
- Exact variant/location balances
- Reservations and stock movements
- Adjustments and transfers

### Customer Data

- Users, roles, addresses, and consent
- Customer sessions and activity events
- Recommendation interactions
- Derived preference profiles

### Payment

- Payment records and attempts
- Payment status history
- Capture and refund limits
- Provider-event deduplication

## Completed Work

- [x] Inspected and preserved the existing Next.js storefront.
- [x] Established pnpm workspace and Turborepo foundations.
- [x] Recorded MongoDB service ownership architecture.
- [x] Created separate catalog model files.
- [x] Added category and subcategory page content with two banners and two
      descriptions.
- [x] Added reusable shoppable image assets with product hotspots.
- [x] Added guest carts, checkout sessions, orders, and abandoned checkouts.
- [x] Added customer roles, consent, activity, and preference models.
- [x] Added payment and payment-attempt models.
- [x] Added city-specific inventory, reservation, movement, adjustment, and
      transfer models.
- [x] Created runnable Commerce and Inventory NestJS/Fastify APIs.
- [x] Added validated MongoDB configuration, JSON logs, health checks, and
      OpenAPI documentation.
- [x] Connected Commerce and Inventory to separate databases on the existing
      MongoDB cluster.
- [x] Removed Docker as a requirement for the normal development workflow.
- [x] Added the logged API test runner.
- [x] Added validated MongoDB catalog APIs for categories, subcategories,
      collections, colors, size groups, sizes, products, variants, and
      shoppable images.

## Current Validation Status

- Logged API runner: 17/17 live service and catalog checks passing on
  2026-09-01.
- Commerce and Inventory API type checks: passing.
- Commerce and Inventory API lint: passing.
- Service model and API tests: passing.
- Existing Next.js production build: passing.
- Existing storefront full lint: has pre-existing React lint errors that still
  need a dedicated cleanup task.

## Next Implementation Phases

1. Add Inventory availability and reservation endpoints.
2. Add shared request, response, and event contracts.
3. Implement the Berlin / White / Large checkout vertical slice.
4. Turn Payment into a runnable sandbox-payment API.
5. Add cart and order orchestration between Commerce and Inventory.
6. Add the Admin dashboard foundation.
7. Add authentication and permission enforcement.
8. Add promotions, returns, cancellations, and refunds.
9. Add customer activity ingestion and abandoned-checkout recovery.
10. Add AI search, styling, and authenticated order support.
11. Add business policy and accounting integration services.
12. Add production infrastructure, observability, Redis, and RabbitMQ.

## Change Log

### 2026-09-01

- Created this living workflow and status document.
- Added a Node.js API test runner with readable logs and failure exit codes.
- Ran the API test runner against the live Commerce and Inventory services;
  service information, liveness, MongoDB readiness, and OpenAPI checks all
  passed.
- Added catalog list, read, create, and update endpoints with pagination,
  filtering, strict request validation, duplicate handling, and archive or
  active-state workflows instead of destructive deletion.
- Extended the live API test runner to check every catalog collection.
