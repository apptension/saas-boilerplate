FROM node:20-alpine

WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn

COPY . /app/

ENTRYPOINT ["/bin/sh", "scripts/run.sh"]
