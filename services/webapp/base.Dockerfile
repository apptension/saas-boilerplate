##
# Chamber installation stage
##

FROM segment/chamber:2 AS chamber

FROM node:16-alpine

COPY --from=chamber /chamber /bin/chamber

WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./

RUN yarn
