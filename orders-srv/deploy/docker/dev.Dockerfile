# ------------------------------------------------------------------------------------------------
# LOCAL DEVELOPMENT Dockerfile for Orders microservice of BigTix platform E-Commerce project
# @since orders-srv-start--JP
# ------------------------------------------------------------------------------------------------

FROM node:alpine

WORKDIR /app

# Copy workspace packages (built dist folders and package.json files)
COPY packages/common/package.json ./packages/common/
COPY packages/common/dist ./packages/common/dist
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/middleware/dist ./packages/middleware/dist

# Copy orders-srv package.json and modify it to use file: protocol for local packages
COPY orders-srv/package.json ./package.json.tmp
RUN sed 's|"@bigtix/common": "\*"|"@bigtix/common": "file:./packages/common"|g; s|"@bigtix/middleware": "\*"|"@bigtix/middleware": "file:./packages/middleware"|g' ./package.json.tmp > ./package.json && rm ./package.json.tmp

# Install orders-srv dependencies (will install local packages via file: protocol)
RUN npm install --omit=dev

# Copy orders-srv source code and config files
COPY orders-srv/src ./src
COPY orders-srv/tsconfig.json ./tsconfig.json
COPY orders-srv/tests ./tests

# Polling so Skaffold-synced file changes are detected (inotify often doesn't fire for sync)
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]