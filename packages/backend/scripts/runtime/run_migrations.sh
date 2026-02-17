#!/bin/bash
set -e

if [ -n "${CHAMBER_SERVICE_NAME:-}" ]; then
  RUN_CMD="/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./manage.py"
else
  RUN_CMD="uv run python manage.py"
fi

echo "Running database migrations..."
$RUN_CMD migrate --noinput

echo "Initializing subscriptions..."
$RUN_CMD init_subscriptions || echo "init_subscriptions skipped (may require Stripe configuration)"

echo "Initializing customer plans..."
$RUN_CMD init_customers_plans || echo "init_customers_plans skipped (may require Stripe configuration)"

echo "Initializing locales..."
$RUN_CMD init_locales || echo "init_locales skipped"

TRANSLATIONS_MASTER_FILE="/app/translations/master.json"
if [ -f "$TRANSLATIONS_MASTER_FILE" ]; then
  echo "Syncing translation keys from $TRANSLATIONS_MASTER_FILE..."
  $RUN_CMD sync_translations "$TRANSLATIONS_MASTER_FILE" || echo "sync_translations skipped"
else
  echo "Translations master file not found at $TRANSLATIONS_MASTER_FILE, skipping sync"
fi

TRANSLATIONS_EXPORT_FILE="/app/translations/translations_export.json"
if [ -f "$TRANSLATIONS_EXPORT_FILE" ]; then
  echo "Importing translations from $TRANSLATIONS_EXPORT_FILE..."
  $RUN_CMD import_translations "$TRANSLATIONS_EXPORT_FILE" || echo "import_translations skipped"
else
  echo "Translations export file not found at $TRANSLATIONS_EXPORT_FILE, skipping import"
fi

echo "Migrations complete."
