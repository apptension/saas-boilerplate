#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

yarn graphql:generate-types
yarn lint
yarn test --watchAll=false
