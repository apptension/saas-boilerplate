#!/bin/bash
set -e

# VERSION MARKER: If you see this, the new code is deployed
echo "=== CELERY WORKER STARTUP v2 (2026-01-05) ==="

# Ensure Django settings module is set for all Python commands
export DJANGO_SETTINGS_MODULE=config.settings

echo "Waiting for database to be ready..."

# Initial delay to give backend-api time to start migrations
# This prevents hammering the database during cold starts
echo "Giving backend-api a head start (30s)..."
sleep 30

# Wait for Django migrations to be applied
# On cold starts, database + migrations can take 5-10 minutes
MAX_RETRIES=120
RETRY_INTERVAL=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if pdm run python -c "
import django
django.setup()
from django.db import connection, close_old_connections
try:
    with connection.cursor() as cursor:
        cursor.execute(\"SELECT 1 FROM django_migrations LIMIT 1\")
finally:
    close_old_connections()
" 2>/dev/null; then
        echo "Database ready!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Warning: Timed out waiting for database. Starting anyway..."
fi

echo "Starting celery worker – default queue..."

# TEMPORARY: Purge old tasks that may be stuck in queue
echo "Purging stale tasks from queue..."
pdm run celery -A config purge -f || echo "Queue purge failed (may be empty)"

# Concurrency settings for memory-constrained environments
# CELERY_WORKER_CONCURRENCY: Number of worker processes (default: 2 for starter plans)
# CELERY_WORKER_MAX_TASKS_PER_CHILD: Restart worker after N tasks to prevent memory leaks
# Lower values = more frequent restarts = less memory accumulation
CONCURRENCY="${CELERY_WORKER_CONCURRENCY:-2}"
MAX_TASKS="${CELERY_WORKER_MAX_TASKS_PER_CHILD:-50}"

echo "Worker concurrency: $CONCURRENCY, max tasks per child: $MAX_TASKS"

pdm run celery -A config worker -l info \
    --concurrency="$CONCURRENCY" \
    --max-tasks-per-child="$MAX_TASKS" \
    --prefetch-multiplier=1
