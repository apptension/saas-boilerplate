#!/bin/bash

cd /app/packages/workers/ || exit

pdm sync --prod # Sync command before deployment is needed to prevent deploying dev dependencies
pnpm run sls --version
pnpm run sls deploy --stage "${ENV_STAGE}"
