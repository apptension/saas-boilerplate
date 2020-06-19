#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

./scripts/wait-for-it.sh db:5432

python manage.py migrate
python manage.py runserver 0.0.0.0:5000
