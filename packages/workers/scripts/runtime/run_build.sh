#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

uv sync --frozen --no-dev
pnpm run sls package --stage "${ENV_STAGE}"
