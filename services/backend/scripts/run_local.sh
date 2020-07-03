#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

. $(dirname "$0")/install_localstack_fixtures.sh

./scripts/wait-for-it.sh db:5432

echo "Install LocalStack fixture"

wait_for_s3
create_event_bus
verify_email_in_ses

echo "LocalStack fixtures installed"

python manage.py migrate
python manage.py runserver 0.0.0.0:5000
