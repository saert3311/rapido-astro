# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ARG PUBLIC_TURNSTILE_SITE_KEY
ARG PUBLIC_GTM_ID
COPY . .
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --chown=node:node package.json server.mjs ./
COPY --chown=node:node src/lib ./src/lib
COPY --chown=node:node src/config/site.ts ./src/config/site.ts
COPY --chown=node:node --from=builder /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]
