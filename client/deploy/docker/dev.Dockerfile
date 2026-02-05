# ------------------------------------------------------------------------------------------------
# LOCAL DEVELOPMENT Dockerfile for Frontend client of BigTix platform E-Commerce project
# @since react-app--JP
# ------------------------------------------------------------------------------------------------
# Build context: repo root (.) so we can copy packages/

FROM node:alpine

WORKDIR /app

# Copy workspace package (client only needs @bigtix/common)
COPY packages/common/package.json ./packages/common/
COPY packages/common/dist ./packages/common/dist

# Copy client source and config, then point @bigtix/common to local package
COPY client/ .
RUN sed 's|"@bigtix/common": "\*"|"@bigtix/common": "file:./packages/common"|g' ./package.json > ./package.json.tmp && mv ./package.json.tmp ./package.json

# Install dependencies (uses file:./packages/common)
RUN npm install

CMD ["npm", "run", "dev"]