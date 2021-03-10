FROM segment/chamber:2 AS chamber

FROM cypress/included:6.6.0

COPY --from=chamber /chamber /bin/chamber

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

ENTRYPOINT []