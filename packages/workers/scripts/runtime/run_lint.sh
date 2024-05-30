#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

if [ "${CI:-}" = "true" ]; then
	black --config=pyproject.toml --check .
	ruff check .
else
	black --config=pyproject.toml .
	ruff check --fix .
fi
