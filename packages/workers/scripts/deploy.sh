#!/bin/bash

cd /app/packages/workers/ || exit

node_modules/.bin/sls --version
node_modules/.bin/sls deploy --stage "${ENV_STAGE}"
