#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

flake8
black --config=pyproject.toml --check .

./scripts/wait-for-it.sh db:5432
python setup.py test
