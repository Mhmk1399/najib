# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# -----------------------
# Dependencies
# -----------------------
FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund


# -----------------------
# Build
# -----------------------
FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN --mount=type=secret,id=env_production,target=/app/.env.production,required=true \
    npm run build


# -----------------------
# Production
# -----------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=30s \
    --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3000/', r => { r.resume(); process.exit(r.statusCode >= 200 && r.statusCode < 400 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server.js"]
