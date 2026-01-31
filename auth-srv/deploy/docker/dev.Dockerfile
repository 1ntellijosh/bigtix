# ------------------------------------------------------------------------------------------------
# auth-srv LOCAL DEVELOPMENT Dockerfile for BigTix platform microservices E-Commerce project
# @since auth-micro-start--JP
# ------------------------------------------------------------------------------------------------

FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]