#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

version_gte() { test "$(echo "$@" | tr " " "\n" | sort -rV | head -n 1)" == "$1"; }

node_version=$(node --version)

if version_gte "${node_version}" "v17.0.0"; then
  echo "Adding --openssl-legacy-provider to NODE_OPTIONS env var for Node version greater or equal 17"
  export NODE_OPTIONS="${NODE_OPTIONS:-} --openssl-legacy-provider"
fi

storybook dev --port 5002
