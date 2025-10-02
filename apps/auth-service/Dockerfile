FROM node:20-alpine AS base

RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/auth-service ./apps/auth-service

RUN pnpm install --frozen-lockfile

FROM base AS development

RUN find . -name "*.tsbuildinfo" -type f -delete

RUN cd /app/packages/types && pnpm build
RUN cd /app/packages/utils && pnpm build

WORKDIR /app/apps/auth-service

ENV NODE_ENV=development

EXPOSE 3002

CMD ["pnpm", "dev"]

FROM base AS production

RUN find . -name "*.tsbuildinfo" -type f -delete

RUN cd /app/packages/types && pnpm build
RUN cd /app/packages/utils && pnpm build
RUN cd /app/apps/auth-service && pnpm build

RUN ls -la /app/apps/auth-service/dist/main.js

WORKDIR /app/apps/auth-service

ENV NODE_ENV=production

EXPOSE 3002

CMD ["node", "dist/main.js"]
