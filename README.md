This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend services

Commerce, Inventory, Payment, and Customer Data are independent Node.js
services built with NestJS and Fastify. Each validates its own configuration
and connects to its own MongoDB database.

Add a server-only MongoDB connection string to the root `.env` file:

```bash
MONGODB_URI=mongodb+srv://username:password@your-cluster.example.mongodb.net
```

All services can use the same MongoDB cluster while keeping separate Commerce,
Inventory, Payment, and Customer Data databases.
Start each service in a separate terminal:

```bash
pnpm dev:commerce
pnpm dev:inventory
pnpm dev:payment
pnpm dev:customer-data
```

Check the live APIs, or run the isolated inventory reservation transaction
test (its temporary MongoDB records are automatically removed):

```bash
pnpm test:apis
pnpm test:inventory-flow
pnpm test:vertical-slice
pnpm test:auth-flow
pnpm test:admin-auth-flow
```

Commerce runs on port `4001`, Inventory on `4002`, Payment on `4003`, and
Customer Data on `4004`. All expose
service information under `/api/v1`, liveness under `/api/v1/health/live`,
readiness under `/api/v1/health/ready`, and OpenAPI documentation under `/docs`.

### Shared service contracts

`packages/contracts` contains the validated HTTP commands, responses, and
versioned events shared by Commerce, Inventory, Payment, and Customer Data.
Run its tests with:

```bash
pnpm contracts:test
```

`pnpm test:vertical-slice` creates an isolated Berlin / White / Large purchase,
verifies all four services, and removes its temporary records.

### Admin and staff access

The Admin application runs separately on port `3001`:

```bash
npm run dev:admin
```

Staff identity and sessions are owned by Customer Data. Create the first owner
account with `npm run staff:create`; the exact safe command and role matrix are
documented in `docs/STAFF_AUTHORIZATION.md`. No default password is stored in
the repository.

### Optional container infrastructure

The files under `infrastructure/` are optional and intended for a later DevOps
phase. The current backend services run normally without Docker,
Redis, or RabbitMQ.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
