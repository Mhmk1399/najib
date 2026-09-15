# Unified Account Authentication and Staff Authorization

## Ownership and request flow

The unified User model owns customer and staff identities and database-backed
sessions. Customers and staff use the same `/auth` page and `/api/auth/login`
endpoint. The server resolves permissions after verification and sends customers
to `/customer-dashboard` or authorized staff to `/admin`. Tokens are stored in
`HttpOnly`, `SameSite=Strict` cookies and never returned to browser JavaScript.

Access tokens are signed, scoped, and expire after 15 minutes by default.
Refresh tokens are random opaque values, stored only as SHA-256 hashes, expire
after seven days by default, and rotate on every use. Reuse of an already
rotated token revokes the active token family. Logout revokes the database
session immediately for Customer Data profile checks.

## Roles and permissions

| Role | Primary access |
| --- | --- |
| `owner` | All operational and staff-management permissions |
| `administrator` | All operational and staff-management permissions |
| `catalog_manager` | Catalog, collections, inventory reading, insights |
| `inventory_manager` | Inventory management, catalog/order reading, insights |
| `order_manager` | Orders, customer reading, inventory and payment reading |
| `customer_support` | Customer support, customer records, order/payment reading |
| `finance` | Payment/refund, order reading, insights |
| `store_staff` | Basic catalog, inventory, order, and customer reading |

Canonical role and permission names live in `packages/contracts/src/auth.ts`.
The mapping lives in `packages/auth/src/index.ts`. Services must enforce
permissions at their controllers or data boundary; hiding an Admin navigation
item is only a usability feature, never the security control.

Existing `accountant` and `merchandiser` records are translated to `finance`
and `catalog_manager` during sign-in so older staff data remains usable.

The `customer` role has no `admin.access` permission. Admin routes enforce that
permission on the server and redirect an authenticated customer to their own
dashboard. The customer dashboard performs the inverse check. `/api/auth/me`
provides a token-free profile check for authenticated clients.

Commerce catalog creation and updates currently require `catalog.write`.
Public catalog reads remain available to the storefront.

## Create or reset a staff account

Set the account values only for the command invocation. No default owner
credential is committed to the repository.

```bash
STAFF_EMAIL=owner@example.com \
STAFF_PASSWORD='choose-a-long-unique-password' \
STAFF_FIRST_NAME=Store \
STAFF_LAST_NAME=Owner \
STAFF_ROLES=owner \
npm run staff:create
```

`STAFF_ROLES` accepts a comma-separated list of canonical roles. Running the
command again for the same email intentionally resets that account's password,
status, and roles and records an audit event.

## Production requirements

- Set the same unique `AUTH_ACCESS_TOKEN_SECRET` (at least 32 random bytes) for
  Customer Data and every service that verifies staff access tokens.
- Serve the Admin application and service-to-service traffic over TLS.
- Put a trusted reverse proxy in front of services and sanitize forwarded IP
  headers there.
- Add Redis-backed IP and account throttling before public exposure. The
  current database account lockout protects known accounts but is not a
  distributed edge rate limiter.
- Add MFA for owner, administrator, and finance roles before production.
- Rotate the access-token secret through a planned key-version mechanism;
  changing the single current secret invalidates every access token.

## Validation

```bash
npm run typecheck
npm run test:api
```

The API script creates an isolated temporary customer, tests customer session
rotation and logout, promotes that temporary record to an owner for the admin
destination/isolation checks, then removes its user, session, and audit records.
