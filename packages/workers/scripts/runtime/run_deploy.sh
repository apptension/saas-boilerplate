#!/bin/bash

cd /app/packages/workers/ || exit

uv sync --frozen --no-dev
pnpm run sls --version
pnpm run sls deploy --stage "${ENV_STAGE}"
