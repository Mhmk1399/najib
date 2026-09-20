# Next.js Consolidation

This project now runs as one primary Next.js application. Public storefront pages,
the admin dashboard, unified account auth, and catalog CRUD APIs live in the root app
instead of separate NestJS services or a separate admin Next app.

## Runtime

Use npm:

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

Local routes:

- Public storefront: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`
- Customer dashboard: `http://localhost:3000/customer-dashboard`
- Login and sign-up: `http://localhost:3000/auth`
- Catalog API: `http://localhost:3000/api/catalog/:resource`
- Staff auth API: `http://localhost:3000/api/auth/login`

No `pnpm`, workspace filters, Turbo scripts, or service ports are required for
the consolidated app path.

## Folder Layout

- `app/` contains the public App Router pages and root API routes.
- `app/admin/` contains the admin routes inside the same Next app.
- `app/api/auth/` contains customer/staff login, sign-up, profile, refresh, and logout endpoints.
- `app/api/catalog/` contains catalog list, read, create, and update endpoints.
- `components/admin/` contains admin UI components copied from the old admin app.
- `lib/auth/` contains shared account cookies, profile verification, and role destinations.
- `lib/admin/` contains permission-enforced admin session and dashboard helpers.
- `lib/server/` contains shared backend helpers for database, auth tokens,
  responses, and typed API errors.
- `models/auth/` contains unified user/session/audit Mongoose models.
- `models/catalog/` contains catalog Mongoose models.
- `services/auth/` contains account authentication business logic.
- `services/catalog/` contains catalog CRUD business logic and validation schemas.

The old service source trees under `services/*/src` are treated as legacy code
and excluded from root typechecking. Move any remaining required business logic
into the root `services/`, `models/`, `lib/`, and `app/api/` structure before
removing those legacy folders.

## Environment

Required:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/najib
AUTH_ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
```

The application intentionally refuses to create or verify access tokens in
production when `AUTH_ACCESS_TOKEN_SECRET` is missing. The built-in fallback is
for local development only.

Optional:

```bash
MONGODB_DB_NAME=najib
AUTH_ACCESS_TOKEN_TTL_SECONDS=900
AUTH_REFRESH_TOKEN_TTL_SECONDS=1209600
```

Temporary local Payment/SMS providers (never selected implicitly in production):

```bash
PAYMENT_PROVIDER=mock
SMS_PROVIDER=mock
```

S3-compatible uploads, including Liara Object Storage buckets:

```bash
S3_ENDPOINT=https://your-s3-compatible-endpoint
S3_REGION=default
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_BASE_URL=https://your-public-bucket-domain
S3_FORCE_PATH_STYLE=true
S3_UPLOAD_PREFIX=uploads
# Optional, only if the provider supports object ACLs:
# S3_OBJECT_ACL=public-read
```

`S3_PUBLIC_BASE_URL` should be the public URL/domain for the bucket. If it is
not set, uploaded file URLs are built as `S3_ENDPOINT/S3_BUCKET/key`, which is
fine for some S3-compatible providers but not all custom domains.

## API Behavior

Auth routes set HTTP-only, SameSite Strict cookies:

- `najib_access`
- `najib_refresh`

The old `najib_admin_access` and `najib_admin_refresh` names are read during the
transition and cleared after login, refresh, or logout. Browser JavaScript never
receives either token in a response body.

The shared login endpoint resolves the destination from server-side permissions:

- Accounts with `admin.access` go to `/admin`.
- Customer/non-admin accounts go to `/customer-dashboard`.

`GET /api/auth/me` returns the verified profile and resolved destination without
returning access or refresh tokens. Both dashboards repeat their authorization
check on the server; a customer cannot enter Admin, and a staff account is sent
away from the customer dashboard.

Catalog routes use the shared staff session guard and role permissions:

- `GET /api/catalog/:resource`
- `POST /api/catalog/:resource`
- `GET /api/catalog/:resource/:id`
- `PATCH /api/catalog/:resource/:id`

Request bodies are validated with Zod before writes. Business errors are
returned as JSON with stable HTTP statuses instead of leaking raw exceptions.

## Notes

- The public storefront UI was left in place.
- The admin UI was moved under `/admin` without redesigning its screens.
- Root `npm run typecheck` and `npm run test:api` verify the single Next app,
  including isolated customer sign-up/login/refresh/logout and role isolation.
- Root `npm run build` verifies the single Next app, including the admin and API
  routes.
- `npm run typecheck` uses `tsconfig.typecheck.json` so stale Next dev cache
  types do not conflict with production route types.
