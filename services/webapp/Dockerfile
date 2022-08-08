ARG BASE_IMAGE=node:16-alpine
FROM ${BASE_IMAGE}

WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

RUN chmod +x ./scripts/*.sh
