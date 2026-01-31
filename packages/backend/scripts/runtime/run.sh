#!/bin/bash
set -e

echo "Running database migrations..."
pdm run python manage.py migrate --noinput

echo "Initializing subscriptions..."
pdm run python manage.py init_subscriptions || echo "init_subscriptions skipped (may require Stripe configuration)"

echo "Initializing customer plans..."
pdm run python manage.py init_customers_plans || echo "init_customers_plans skipped (may require Stripe configuration)"

# Initialize locales (creates default language configurations)
echo "Initializing locales..."
pdm run python manage.py init_locales || echo "init_locales skipped"

# Sync translation keys if master file exists
TRANSLATIONS_MASTER_FILE="/app/translations/master.json"
if [ -f "$TRANSLATIONS_MASTER_FILE" ]; then
    echo "Syncing translation keys from $TRANSLATIONS_MASTER_FILE..."
    pdm run python manage.py sync_translations "$TRANSLATIONS_MASTER_FILE" || echo "sync_translations skipped"
else
    echo "Translations master file not found at $TRANSLATIONS_MASTER_FILE, skipping sync"
fi

# Import pre-translated content if export file exists
TRANSLATIONS_EXPORT_FILE="/app/translations/translations_export.json"
if [ -f "$TRANSLATIONS_EXPORT_FILE" ]; then
    echo "Importing translations from $TRANSLATIONS_EXPORT_FILE..."
    pdm run python manage.py import_translations "$TRANSLATIONS_EXPORT_FILE" || echo "import_translations skipped"
else
    echo "Translations export file not found at $TRANSLATIONS_EXPORT_FILE, skipping import"
fi

echo "Starting app server..."
pdm run gunicorn -c python:config.gunicorn config.asgi:application
