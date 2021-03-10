ARG BASE_IMAGE=cypress/included:6.6.0
FROM ${BASE_IMAGE}

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . ./

RUN chmod +x ./scripts/*.sh

ENTRYPOINT []
