FROM node:20-alpine AS base

RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service

RUN pnpm install --frozen-lockfile

FROM base AS development

RUN find . -name "*.tsbuildinfo" -type f -delete

WORKDIR /app/apps/notifications-service

ENV NODE_ENV=development

EXPOSE 3001

CMD ["pnpm", "dev"]

FROM base AS production

RUN find . -name "*.tsbuildinfo" -type f -delete

RUN cd /app/apps/notifications-service && pnpm build

RUN ls -la /app/apps/notifications-service/dist/main.js

WORKDIR /app/apps/notifications-service

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]
