# Next.js 15 (App Router) on Bun — one process serves pages and API routes.
# The build context is the repository root because @mlai/web imports the shared
# packages/contracts vocabulary. Only the app and that package are copied.
FROM oven/bun:1.4-slim AS builder
WORKDIR /workspace/apps/web
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

COPY apps/web/package.json apps/web/bun.lock ./
COPY packages/contracts /workspace/packages/contracts
RUN bun install --frozen-lockfile

COPY apps/web/ ./
RUN bun run build

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as a dedicated, non-root user. Persistent application state belongs in
# Cloud SQL; /app/data is writable scratch space only.
RUN groupadd --system app && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/data && chown -R app:app /app/data \
    && chown app:app /app

COPY --from=builder --chown=app:app /workspace/apps/web/.next ./.next
COPY --from=builder --chown=app:app /workspace/apps/web/public ./public
COPY --from=builder --chown=app:app /workspace/apps/web/node_modules ./node_modules
COPY --from=builder --chown=app:app /workspace/apps/web/package.json ./package.json
COPY --from=builder --chown=app:app /workspace/apps/web/next.config.ts ./next.config.ts

USER app
EXPOSE 3000

# Bun has fetch built in, so the slim image needs no curl/wget dependency.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "bun run next start -p ${PORT:-3000}"]
