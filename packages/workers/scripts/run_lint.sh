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

nx lint:js
