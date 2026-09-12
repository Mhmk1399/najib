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
- The Admin interface is Persian-only and uses right-to-left layout.
- Customer-facing catalog text must include Persian (`fa`), English (`en`),
  and Arabic (`ar`) values in every API response.
- Slugs, IDs, SKU, currency, prices, statuses, URLs, and relationships remain
  language-neutral.
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
        |
        +--> Payment API -------> najib_payment MongoDB database
        |
        +--> Customer Data API -> najib_customer_data MongoDB database
```

Start the storefront and APIs in separate terminals:

```bash
pnpm dev
pnpm dev:commerce
pnpm dev:inventory
pnpm dev:payment
pnpm dev:customer-data
```

For Admin catalog work, start its required processes together in one terminal:

```bash
pnpm dev:admin-stack
```

Run backend API checks:

```bash
pnpm test:apis
```

Run the isolated inventory transaction test (it removes its own temporary
records):

```bash
pnpm test:inventory-flow
pnpm test:vertical-slice
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
- [x] Added store-level availability and transactional inventory reservation
      APIs, including idempotent creation, commit, release, and expiry.
- [x] Added versioned shared HTTP and event contracts for Commerce, Inventory,
      Payment, and Customer Data.
- [x] Completed the Berlin / White / Large checkout vertical slice across all
      four currently runnable backend services.
- [x] Added verified sandbox payment webhooks and retryable Commerce callbacks.
- [x] Added OrderConfirmed and accounting transactional outbox records.
- [x] Added the standalone Najib Admin foundation with a responsive operations
      dashboard, dark mode, global search, and server-side service health.
- [x] Added staff authentication, rotating database sessions, role/permission
      contracts, audit records, protected Admin routes, and guarded Commerce
      catalog writes.
- [x] Added the protected Admin product ledger with real search, filters,
      pagination, category-aware create/edit forms, integer-price conversion,
      and permission-aware actions.
- [x] Added a server-only Admin catalog gateway that keeps staff tokens out of
      browser code and enforces catalog read/write permissions.
- [x] Aligned category/subcategory page-content API validation with MongoDB and
      added product taxonomy/reference integrity checks.
- [x] Added the protected Admin Page Composer for category and subcategory
      campaign pages, including two banners, two descriptions, thumbnails,
      visibility, ordering, and SEO metadata.
- [x] Added the protected Admin Image Stories workspace with real image
      metadata, focal-point controls, product and variant links, and visual
      hotspot placement.
- [x] Added shared Catalog navigation between Products, Page Composer, and
      Image Stories.
- [x] Added an idempotent Admin API demo-data seed for visible catalog review.
- [x] Added the trilingual catalog contract and migration for Persian, English,
      and Arabic customer-facing content.

## Current Validation Status

- Logged API runner: 28/28 live service, catalog, and Inventory route checks
  passing on 2026-09-02.
- Isolated real-MongoDB inventory transaction flow: passing on 2026-09-02.
- Commerce, Inventory, Payment, and Customer Data type checks: passing.
- New backend and contract lint checks: passing.
- Shared contract tests: 9/9 passing.
- Shared authentication tests: 2/2 passing.
- Service model, API, security, and contract-compatibility tests: 49/49 passing.
- Live staff authentication flow: 11/11 checks passing.
- Live Admin session-gateway flow: 5/5 checks passing.
- Isolated Berlin / White / Large end-to-end purchase test: passing.
- Commerce catalog and service tests: 24/24 passing on 2026-09-08.
- Live Admin catalog flow: anonymous rejection, sign-in, list, create, search,
  update, relation validation, and safe-query checks passing; temporary data is
  removed automatically.
- Admin lint, TypeScript check, and production build: passing on 2026-09-07.
- Independent Admin catalog visual evaluation: PASS at 1440x1000 and 390x844;
  mobile controls were refined to the required 44px minimum.
- Admin browser checks completed at 1440x1000 and 390x844; mobile navigation,
  responsive tables, and horizontal overflow were verified.
- Live Admin page-content and shoppable-image flow: 13/13 checks passing on
  2026-09-08, including safe URLs, real banner references, nested page updates,
  hotspot relations, filtering, searching, and automatic cleanup.
- Page Composer and Image Stories browser checks completed at 1440x1000 and
  390x844; the full editor, responsive layout, and explicit hotspot placement
  were verified without horizontal overflow.
- Demo catalog seed verified through the Admin API on 2026-09-09: 4 products,
  2 categories, 3 subcategories, 2 collections, and 7 image records.
- Existing Next.js production build currently stops at the unrelated missing
  `contexts/theme-context` storefront import.
- Existing storefront full lint: has pre-existing React lint errors that still
  need a dedicated cleanup task.

## Next Implementation Phases

1. Add product variants, colors, sizes, collections, then exact stock.
2. Add admin reporting endpoints and replace dashboard demo data.
3. Add staff management, invitations, password recovery, and MFA.
4. Add promotions, returns, cancellations, and refunds.
5. Add abandoned-checkout recovery and preference-profile processing.
6. Add AI search, styling, and authenticated order support.
7. Add business policy and accounting integration services.
8. Add production infrastructure, observability, Redis, and RabbitMQ.

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

### 2026-09-02

- Added exact store-level availability checks across active locations in the
  store's effective inventory-pool binding.
- Added atomic reservation creation with cross-location allocation,
  idempotency keys, expiry timestamps, and stock movement audit records.
- Added reservation commit, release, and expired-reservation processing.
- Verified the complete reserve, idempotent retry, commit, and release flow
  against the configured MongoDB cluster using isolated temporary data.
- Extended the logged live API suite to 20 checks; all pass.
- Created the `@najib/contracts` workspace package with common money, identity,
  pagination, error, checkout, reservation, payment, customer activity, and
  versioned event schemas.
- Replaced duplicated Commerce and Inventory validation primitives with shared
  contracts and added compatibility tests for service status values.
- Verified 6 contract tests, 43 service tests, and 20 live API checks.
- Made Payment and Customer Data independently runnable NestJS/Fastify APIs.
- Added cart creation, exact-variant cart items, immutable order snapshots, and
  Commerce checkout orchestration.
- Added signed sandbox webhooks, payment callback retries, reservation commit
  or release, confirmed-order events, customer purchase activity, and an
  accounting outbox queue.
- Verified that only Berlin White/Large changed from 3 to 2; Berlin
  Black/Large, Berlin White/Small, and Dubai White/Large remained at 3.
- Extended the live API runner to all four services; 28/28 checks pass.
- Added `apps/admin` as an independently runnable Next.js application aligned
  with the storefront's cream, black, white, and copper design language.
- Added responsive navigation, theme persistence, command search, KPI and
  order views, inventory alerts, a lightweight chart, activity, quick actions,
  and graceful server-only health checks.
- Kept aggregate commerce figures clearly marked as demo data until reporting
  APIs are available, with authentication and RBAC recorded as the next gate.
- Verified the Admin lint, type check, production build, and desktop/mobile
  browser layouts.
- Added canonical staff roles and permissions plus a dependency-light shared
  access-token verifier for independently deployed services.
- Added salted scrypt password hashing, generic login failures, temporary
  account lockout, hashed rotating refresh sessions, replay-family revocation,
  staff audit records, logout, and logout-all support to Customer Data.
- Added the branded Admin sign-in page, strict HTTP-only cookies, optimistic
  route redirection, secure database-backed profile verification, logout, and
  permission-aware navigation.
- Protected Commerce catalog mutations with `catalog.write` while preserving
  public storefront catalog reads.
- Added isolated backend and Admin live authentication flow tests and staff
  bootstrap documentation without creating a default credential.

### 2026-09-07

- Added a real-data Admin product ledger and create/edit folio with search,
  status/category filters, pagination, responsive cards, validation, and
  permission-aware controls.
- Added protected same-origin Admin catalog routes; browser code never receives
  the internal Commerce URL or staff bearer token.
- Fixed the category/subcategory page-content contract so its two banners, two
  structured descriptions, and SEO fields match the Mongo model.
- Added product reference validation for category/subcategory pairing,
  collections, and images, plus explicit clearing of optional product-story
  fields.
- Added an isolated logged Admin catalog flow test and completed independent
  desktop/mobile visual evaluation.

### 2026-09-08

- Added the real-data Page Composer for category and subcategory landing-page
  content, with its required two-banner story and SEO controls.
- Added the Image Stories library and editor with URL-based image metadata,
  focal points, product/variant relationships, and click-to-place hotspots.
- Added backend reference validation so banners, parent categories, products,
  and variants must exist and variants must belong to their selected product.
- Corrected shoppable-image product filtering and alt-text/URL searching.
- Added a 13-step live Admin content-flow test with automatic cleanup.
- Verified 24 Commerce tests, Admin lint and type checks, and authenticated
  desktop/mobile browser flows.

### 2026-09-09

- Added a reusable, idempotent demo catalog seed that signs in through the
  Admin gateway and posts real records through the protected Commerce API.
- Seeded visible tailoring, footwear, and leather-goods products, complete
  category-page stories, two collections, local storefront imagery, and an
  editorial image with four product hotspots.
