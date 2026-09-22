# Next.js 16 (App Router) on Bun — one process serves pages and API routes.
#
# The build context is the repository root: every app installs through the one
# root Bun workspace (root bun.lock + bunfig.toml, isolated linker). A frozen
# install needs the root manifest, the lockfile, the linker settings and every
# workspace manifest the lockfile names, even though only @quesar/web and its
# workspace dependencies are installed. The root .dockerignore keeps other
# sources, data and build output out of the context.
FROM oven/bun:1.4-slim AS builder
WORKDIR /workspace
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

COPY package.json bun.lock bunfig.toml ./
COPY apps/mlai/package.json apps/mlai/
COPY apps/quasar/package.json apps/quasar/
COPY apps/quasar/packages/shared/package.json apps/quasar/packages/shared/
COPY apps/quasar/packages/service/package.json apps/quasar/packages/service/
# Shared workspace packages in full: @quesar/web imports @mlai/contracts types
# and the @mlai/trailer-engine runtime source.
COPY packages ./packages
# @mlai/platform (the root workspace) is filtered in too: its @types/react pin
# is the fallback that next's own declarations resolve through (bunfig.toml
# explains why), and `next build` type-checks against it.
RUN bun install --filter @mlai/platform --filter @quesar/web --frozen-lockfile

COPY apps/mlai ./apps/mlai
COPY sidecars/python-worker ./sidecars/python-worker
WORKDIR /workspace/apps/mlai
RUN bun run build

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Run as a dedicated, non-root user. Persistent application state belongs in
# Cloud SQL; /app/data is writable scratch space only.
RUN groupadd --system app && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/data && chown -R app:app /app/data \
    && chown app:app /app

# output: "standalone" with the tracing root at the repository root emits the
# server at .next/standalone/apps/mlai/server.js beside a pruned node_modules
# tree. Static assets and public/ are not traced and are copied beside it.
COPY --from=builder --chown=app:app /workspace/apps/mlai/.next/standalone ./
COPY --from=builder --chown=app:app /workspace/apps/mlai/.next/static ./apps/mlai/.next/static
COPY --from=builder --chown=app:app /workspace/apps/mlai/public ./apps/mlai/public

USER app
WORKDIR /app/apps/mlai
EXPOSE 3000

# Bun has fetch built in, so the slim image needs no curl/wget dependency.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# server.js reads PORT (Cloud Run sets it) and HOSTNAME.
CMD ["bun", "server.js"]
