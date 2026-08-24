# Next.js 15 (App Router) on Bun — single process serves pages + /api routes.
# Cloud Run injects PORT; next start binds it via -p ${PORT}.
FROM oven/bun:1.4-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as a dedicated, non-root user (defense in depth — nothing in this
# image needs root at runtime).
RUN groupadd --system app && useradd --system --gid app --home-dir /app app \
    # Keep a writable scratch directory for runtime tooling. Persistent
    # application state belongs in Cloud SQL; this directory is never a
    # database fallback.
    && mkdir -p /app/data && chown -R app:app /app/data \
    # /app itself must belong to `app` too. WORKDIR creates it root:root, and
    # `COPY --chown` only sets ownership on the entries it copies — not on the
    # pre-existing parent. Runtime diagnostics may need a writable CWD even
    # though persistent application data is remote.
    && chown app:app /app

COPY --from=builder --chown=app:app /app/.next ./.next
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/next.config.ts ./next.config.ts

USER app
EXPOSE 3000

# Bun has fetch built in, so the healthcheck needs no extra binary (the
# slim image has neither curl nor wget). Fails the container if the app
# doesn't answer 2xx/3xx within the timeout.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "bun run next start -p ${PORT:-3000}"]
