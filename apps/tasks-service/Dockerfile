FROM node:20-alpine AS base

RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages ./packages
COPY apps/tasks-service ./apps/tasks-service

RUN pnpm install --frozen-lockfile

RUN cd /app/packages/types && pnpm build
RUN cd /app/packages/utils && pnpm build

FROM base AS development

RUN find . -name "*.tsbuildinfo" -type f -delete

WORKDIR /app/apps/tasks-service

COPY apps/tasks-service/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=development

EXPOSE 3003

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "dev"]

FROM base AS production

RUN find . -name "*.tsbuildinfo" -type f -delete

RUN cd /app/apps/tasks-service && pnpm build

RUN ls -la /app/apps/tasks-service/dist/main.js

WORKDIR /app/apps/tasks-service

COPY apps/tasks-service/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3003

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
