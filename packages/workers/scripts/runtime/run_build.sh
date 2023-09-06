#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

pdm sync --prod # Sync command before deployment is needed to prevent deploying dev dependencies
pnpm run sls package --stage "${ENV_STAGE}"
