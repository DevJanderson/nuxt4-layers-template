# Stage 1: Build
FROM node:22-alpine3.21 AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine3.21

LABEL org.opencontainers.image.title="Nuxt Template"

WORKDIR /app

COPY --from=builder /app/.output .output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider --quiet http://localhost:5173/ || exit 1

CMD ["node", ".output/server/index.mjs"]
