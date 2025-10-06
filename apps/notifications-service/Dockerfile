FROM node:20-alpine AS base

RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service

RUN pnpm install --frozen-lockfile

RUN cd /app/packages/types && pnpm build
RUN cd /app/packages/utils && pnpm build

FROM base AS development

RUN find . -name "*.tsbuildinfo" -type f -delete

WORKDIR /app/apps/notifications-service

COPY apps/notifications-service/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=development

EXPOSE 3004

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "dev"]

FROM base AS production

RUN find . -name "*.tsbuildinfo" -type f -delete

RUN cd /app/apps/notifications-service && pnpm build

RUN ls -la /app/apps/notifications-service/dist/main.js

WORKDIR /app/apps/notifications-service

COPY apps/notifications-service/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3004

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
