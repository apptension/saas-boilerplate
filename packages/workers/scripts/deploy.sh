#!/bin/bash

cd /app/packages/workers/ || exit

pdm sync --prod # Sync command before deployment is needed to prevent deploying dev dependencies
node_modules/.bin/sls --version
node_modules/.bin/sls deploy --stage "${ENV_STAGE}"
