#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

. $(dirname "$0")/install_localstack_fixtures.sh

echo "Install LocalStack fixture"

wait_for_s3

{
    create_s3_bucket "$AWS_STORAGE_BUCKET_NAME" &&
    create_s3_bucket "$AWS_EXPORTS_STORAGE_BUCKET_NAME" &&
    echo "Scripts S3 BASE buckets created"
} || {
    echo "Scripts S3 buckets NOT created"
}

echo "LocalStack fixtures installed"

python manage.py contentful_sync
python manage.py migrate

# Sync translation keys from master.json if it exists (mounted from webapp)
TRANSLATIONS_MASTER_FILE="/app/translations/master.json"
if [ -f "$TRANSLATIONS_MASTER_FILE" ]; then
    echo "Syncing translation keys..."
    python manage.py sync_translations "$TRANSLATIONS_MASTER_FILE"
else
    echo "Translation master file not found, skipping sync"
fi

if (echo "$STRIPE_LIVE_SECRET_KEY" | grep -q "<CHANGE_ME>") && (echo "$STRIPE_TEST_SECRET_KEY" | grep -q "<CHANGE_ME>"); then
    echo "Stripe initialization skipped"
else
    python manage.py djstripe_sync_models Product Price
    python manage.py init_subscriptions
    python manage.py init_customers_plans
    echo "Stripe initialized"
fi

python manage.py runserver 0.0.0.0:5001
