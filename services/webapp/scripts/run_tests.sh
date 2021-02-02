#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

yarn lint
yarn test --watchAll=false
