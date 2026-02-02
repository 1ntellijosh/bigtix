# ------------------------------------------------------------------------------------------------
# auth-srv PRODUCTION Dockerfile for BigTix platform microservices E-Commerce project
# @since auth-micro-start--JP
# ------------------------------------------------------------------------------------------------

    FROM node:alpine

WORKDIR /app

COPY ./package.json .

RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]