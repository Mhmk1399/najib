# Next.js Consolidation

This project now runs as one primary Next.js application. Public storefront pages,
the admin dashboard, staff auth, and catalog CRUD APIs live in the root app
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
- Admin login: `http://localhost:3000/admin/login`
- Catalog API: `http://localhost:3000/api/catalog/:resource`
- Staff auth API: `http://localhost:3000/api/auth/login`

No `pnpm`, workspace filters, Turbo scripts, or service ports are required for
the consolidated app path.

## Folder Layout

- `app/` contains the public App Router pages and root API routes.
- `app/admin/` contains the admin routes inside the same Next app.
- `app/api/auth/` contains staff login, refresh, and logout endpoints.
- `app/api/catalog/` contains catalog list, read, create, and update endpoints.
- `components/admin/` contains admin UI components copied from the old admin app.
- `lib/admin/` contains admin session and dashboard helpers.
- `lib/server/` contains shared backend helpers for database, auth tokens,
  responses, and typed API errors.
- `models/auth/` contains staff/user/session/audit Mongoose models.
- `models/catalog/` contains catalog Mongoose models.
- `services/auth/` contains staff authentication business logic.
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

Optional:

```bash
MONGODB_DB_NAME=najib
AUTH_ACCESS_TOKEN_TTL_SECONDS=900
STAFF_SESSION_TTL_DAYS=7
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

Auth routes set HTTP-only cookies:

- `najib_admin_access`
- `najib_admin_refresh`

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
- Root `npm run build` verifies the single Next app, including the admin and API
  routes.
- `npm run typecheck` uses `tsconfig.typecheck.json` so stale Next dev cache
  types do not conflict with production route types.
