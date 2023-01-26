#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

flake8

if [ "${CI:-}" = "true" ]
then
  black --config=pyproject.toml --check .
  cov_report="xml:cov/coverage.xml"
else
   black --config=pyproject.toml .
   cov_report=html
fi

./scripts/wait-for-it.sh db:5432

python setup.py create_db
pytest --cov --cov-config=.coveragerc --cov-report="${cov_report}"

if [ "${CI:-}" = "true" ]
then
   sed -i 's/\/app\/packages\/workers/.\/packages\/workers/g' cov/coverage.xml
fi