# ------------------------------------------------------------------------------------------------
# LOCAL DEVELOPMENT Dockerfile for Tickets microservice of BigTix platform E-Commerce project
# @since tickets-srv--JP
# ------------------------------------------------------------------------------------------------

    FROM node:alpine

    WORKDIR /app
    
    # Copy workspace packages (built dist folders and package.json files)
    COPY packages/common/package.json ./packages/common/
    COPY packages/common/dist ./packages/common/dist
    COPY packages/middleware/package.json ./packages/middleware/
    COPY packages/middleware/dist ./packages/middleware/dist
    
    # Copy tickets-srv package.json and modify it to use file: protocol for local packages
    COPY tickets-srv/package.json ./package.json.tmp
    RUN sed 's|"@bigtix/common": "\*"|"@bigtix/common": "file:./packages/common"|g; s|"@bigtix/middleware": "\*"|"@bigtix/middleware": "file:./packages/middleware"|g' ./package.json.tmp > ./package.json && rm ./package.json.tmp
    
    # Install tickets-srv dependencies (will install local packages via file: protocol)
    RUN npm install --omit=dev
    
    # Copy tickets-srv source code and config files
    COPY tickets-srv/src ./src
    COPY tickets-srv/tsconfig.json ./tsconfig.json
    COPY tickets-srv/tests ./tests
    
    # Polling so Skaffold-synced file changes are detected (inotify often doesn't fire for sync)
    ENV CHOKIDAR_USEPOLLING=true
    
    CMD ["npm", "start"]