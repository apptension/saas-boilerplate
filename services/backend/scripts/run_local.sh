#!/bin/sh

set -o errexit
set -o pipefail
set -o nounset

sh /app/scripts/await_db.sh

python manage.py migrate
python manage.py runserver 0.0.0.0:5000
