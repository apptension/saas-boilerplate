#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

yarn contentful:generate-types
yarn lint
yarn test --watchAll=false
