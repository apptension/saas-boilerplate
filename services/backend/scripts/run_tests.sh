#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

./scripts/wait-for-it.sh db:5432

flake8
black --config=pyproject.toml --check .

pytest
