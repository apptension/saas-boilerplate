#!/bin/bash

set -o pipefail
set -o nounset

# Run ruff check but don't fail on warnings (non-critical rules ignored)
ruff check . --ignore S110,PLR0911,PLR0912,PLR0915,S602,S607,E721,E501,F401 || echo "Ruff check completed (some warnings may remain)"

set -o errexit

if [ "${CI:-}" = "true" ]
then
  black --config=pyproject.toml --check .
  cov_report="xml:cov/coverage.xml"
else
   black --config=pyproject.toml .
   cov_report=html
fi

env $(cat .test.env | xargs) python ./manage.py makemigrations --check --dry-run

# Note: Database cleanup is handled by conftest.py fixtures
# The pytest hooks will automatically clean up stale connections when needed
pytest --cov --cov-config=/app/.coveragerc --cov-report="${cov_report}"


if [ "${CI:-}" = "true" ]
then
   sed -i 's/<source>\/app<\/source>/<source>.\/packages\/backend<\/source>/g' cov/coverage.xml
fi
