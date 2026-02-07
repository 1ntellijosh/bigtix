# ------------------------------------------------------------------------------------------------
# PRODUCTION Dockerfile for Tickets microservice of BigTix platform E-Commerce project
# @since tickets-srv--JP
# Build context: repo root (.) so packages/common and packages/middleware can be copied.
# ------------------------------------------------------------------------------------------------

    FROM node:alpine

    WORKDIR /app
    
    # Copy workspace packages (built dist + package.json)
    COPY packages/common/package.json ./packages/common/
    COPY packages/common/dist ./packages/common/dist
    COPY packages/middleware/package.json ./packages/middleware/
    COPY packages/middleware/dist ./packages/middleware/dist
    
    # Copy tickets-srv package.json and point workspace deps to local packages
    COPY tickets-srv/package.json ./package.json.tmp
    RUN sed 's|"@bigtix/common": "\*"|"@bigtix/common": "file:./packages/common"|g; s|"@bigtix/middleware": "\*"|"@bigtix/middleware": "file:./packages/middleware"|g' ./package.json.tmp > ./package.json && rm ./package.json.tmp
    
    # Install production dependencies only
    RUN npm install --omit=dev
    
    # Copy tickets-srv source and build for production
    COPY tickets-srv/src ./src
    COPY tickets-srv/tsconfig.json ./tsconfig.json
    RUN npm run build
    
    # Run compiled app (no ts-node)
    CMD ["npm", "run", "start:prod"]
    