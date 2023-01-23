#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

flake8

if [ "${CI:-}" = "true" ]
then
  black --config=pyproject.toml --check .
else
   black --config=pyproject.toml .
fi

./scripts/wait-for-it.sh db:5432

env $(cat .test.env | xargs) python ./manage.py makemigrations --check --dry-run
pytest
