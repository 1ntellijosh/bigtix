# ------------------------------------------------------------------------------------------------
# LOCAL DEVELOPMENT Dockerfile for Authorization microservice of BigTix platform E-Commerce project
# @since auth-micro-start--JP
# ------------------------------------------------------------------------------------------------

FROM node:alpine

WORKDIR /app

# Copy workspace packages (built dist folders and package.json files)
COPY packages/common/package.json ./packages/common/
COPY packages/common/dist ./packages/common/dist
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/middleware/dist ./packages/middleware/dist

# Copy auth-srv package.json and modify it to use file: protocol for local packages
COPY auth-srv/package.json ./package.json.tmp
RUN sed 's|"@bigtix/common": "\*"|"@bigtix/common": "file:./packages/common"|g; s|"@bigtix/middleware": "\*"|"@bigtix/middleware": "file:./packages/middleware"|g' ./package.json.tmp > ./package.json && rm ./package.json.tmp

# Install auth-srv dependencies (will install local packages via file: protocol)
RUN npm install --omit=dev

# Copy auth-srv source code and config files
COPY auth-srv/src ./src
COPY auth-srv/tsconfig.json ./tsconfig.json
COPY auth-srv/tests ./tests

# Polling so Skaffold-synced file changes are detected (inotify often doesn't fire for sync)
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]