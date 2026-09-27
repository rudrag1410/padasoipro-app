# Build context is the repository root (see docker-compose.yml).
FROM node:24-alpine AS build
WORKDIR /repo
RUN corepack enable

# Manifests first, so dependency layers are cached until they change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/api/package.json packages/api/
COPY packages/mobile/package.json packages/mobile/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --filter=@padosipro/api... --frozen-lockfile --ignore-scripts

COPY packages/shared packages/shared
COPY packages/api packages/api
RUN pnpm run build --filter=@padosipro/api

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY packages/api/package.json ./package.json
# @padosipro/shared is bundled into dist, so only runtime deps are needed.
RUN pnpm pkg delete devDependencies && pnpm install --prod --ignore-scripts
COPY --from=build /repo/packages/api/dist ./dist

RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
