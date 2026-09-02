# ADR 0001: Monorepo and service-owned MongoDB databases

## Status

Accepted for the first vertical slice.

## Decision

Najib is one pnpm/Turborepo repository containing the storefront, future admin
application, independently deployable backend services, shared contracts, and
infrastructure.

MongoDB with Mongoose replaces the original PostgreSQL/Prisma proposal. Each
service owns a separate logical database and its own Mongoose schemas. Services
must not import another service's models or connect to another service's
database. Cross-service identifiers are stored only as external string
references.

Initial ownership is:

- Commerce: categories, subcategories, collections, products, variants, colors,
  sizes, carts, checkout sessions, orders, and abandoned checkouts.
- Customer Data: users, customer profiles, roles, addresses, and consent.
- Payment: payments and payment attempts.
- Inventory: inventory balances, reservations, movements, and locations.

MongoDB must run as a replica set in every environment that executes critical
workflows. This allows inventory mutations, order changes, and transactional
outbox writes to commit atomically within the owning service.

Immediate commands use typed HTTP APIs. Asynchronous facts use versioned
RabbitMQ events. Commerce orchestrates checkout; Payment never changes orders,
and Commerce never changes inventory balances directly.

Inventory is isolated by city and inventory pool. Availability is always
calculated for an exact product variant and exact location.

Guest checkout is supported. A cart can belong to an authenticated `userId`, an
`anonymousId`, or both during identity resolution. Guest orders store contact
snapshots and never depend on a later user record.

