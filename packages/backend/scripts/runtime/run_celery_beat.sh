#!/bin/bash
set -e

# Ensure Django settings module is set for all Python commands
export DJANGO_SETTINGS_MODULE=config.settings

echo "Waiting for database migrations to complete..."

# Initial delay to give backend-api time to start migrations
# This prevents hammering the database during cold starts
echo "Giving backend-api a head start (30s)..."
sleep 30

# Wait for the django_celery_beat tables to exist (created by backend-api migrations)
# On cold starts, database + migrations can take 5-10 minutes
MAX_RETRIES=120
RETRY_INTERVAL=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if uv run python -c "
import django
django.setup()
from django.db import connection, close_old_connections
try:
    with connection.cursor() as cursor:
        cursor.execute(\"SELECT 1 FROM django_celery_beat_crontabschedule LIMIT 1\")
finally:
    close_old_connections()
" 2>/dev/null; then
        echo "Database tables ready!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for database tables... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Warning: Timed out waiting for database tables. Starting anyway..."
fi

echo "Starting celery beat service..."

uv run celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
