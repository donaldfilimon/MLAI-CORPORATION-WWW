# Next.js 15 (App Router) on Bun — single process serves pages + /api routes.
# Cloud Run injects PORT; next start binds it via -p ${PORT}.
FROM oven/bun:1.4-slim AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["sh", "-c", "bun run next start -p ${PORT:-3000}"]
