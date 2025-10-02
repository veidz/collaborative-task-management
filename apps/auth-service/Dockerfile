FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/auth-service ./apps/auth-service

RUN pnpm install --frozen-lockfile

FROM base AS builder

RUN pnpm --filter @packages/types build
RUN pnpm --filter @packages/utils build
RUN pnpm --filter @packages/logger build
RUN pnpm --filter @apps/auth-service build

FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/migrations ./migrations
COPY --from=builder /app/apps/auth-service/package.json ./package.json

EXPOSE 3002

CMD ["node", "dist/main.js"]
