FROM segment/chamber:2 AS chamber

FROM cypress/included:12.3.0 AS base
ENV APP_PATH=/home/node/app
ENV SRC_CORE_PATH=packages/internal/core
ENV CORE_PATH=$APP_PATH/$SRC_CORE_PATH
ENV SRC_E2E_PATH=packages/e2e-tests
ENV E2E_PATH=$APP_PATH/$SRC_E2E_PATH

RUN mkdir -p $APP_PATH \
    && mkdir -p /root/.cache/Cypress \
    && mkdir -p $CORE_PATH/node_modules
RUN chown -R node:node /home/node \
    && chmod -R 770 /home/node \
    && chown -R node:node /root/.cache/Cypress

RUN npm install -g pnpm@^8.6.1

COPY --chown=node:node --from=chamber /chamber /bin/chamber

WORKDIR /home/node/app

FROM base AS builder
WORKDIR $APP_PATH
COPY --chown=node:node ./package.json ./pnpm*.yaml $APP_PATH/
COPY --chown=node:node ./$SRC_CORE_PATH/package.json $CORE_PATH/
COPY --chown=node:node ./$SRC_E2E_PATH/package.json $E2E_PATH/
USER node

RUN pnpm install  \
    --include-workspace-root  \
    --frozen-lockfile  \
    --filter=core  \
    --filter=e2e-tests

RUN ls -la packages/e2e-tests/

FROM base AS e2e
WORKDIR $APP_PATH

COPY --chown=node:node --from=builder /root/.cache/Cypress /root/.cache/Cypress
COPY --chown=node:node --from=builder $APP_PATH/node_modules ./node_modules/
COPY --chown=node:node --from=builder $CORE_PATH/node_modules $CORE_PATH/node_modules/
COPY --chown=node:node --from=builder $E2E_PATH/node_modules $E2E_PATH/node_modules/
COPY --chown=node:node --from=builder $APP_PATH/package.json $APP_PATH/pnpm*.yaml ./
COPY --chown=node:node --from=builder $CORE_PATH/package.json $CORE_PATH/
COPY --chown=node:node --from=builder $E2E_PATH/package.json $E2E_PATH/

COPY --chown=node:node nx.json tsconfig* jest* babel* .eslintrc* .prettier* ./
COPY --chown=node:node ./$SRC_CORE_PATH $CORE_PATH/
COPY --chown=node:node ./$SRC_E2E_PATH $E2E_PATH/

WORKDIR $E2E_PATH

RUN chmod +x ./scripts/*.sh

ENTRYPOINT []
