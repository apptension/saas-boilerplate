#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

pipenv run flake8
pipenv run black --config=pyproject.toml --check .

bash ./scripts/wait-for-it.sh localhost:5432
pipenv run python setup.py test
