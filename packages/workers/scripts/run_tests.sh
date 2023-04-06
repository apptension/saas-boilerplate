#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

if [ "${CI:-}" = "true" ]
then
  cov_report="xml:cov/coverage.xml"
else
   cov_report=html
fi

python setup.py create_db
pytest --cov --cov-config=.coveragerc --cov-report="${cov_report}"

if [ "${CI:-}" = "true" ]
then
   sed -i 's/\/app\/packages\/workers/.\/packages\/workers/g' cov/coverage.xml
fi
