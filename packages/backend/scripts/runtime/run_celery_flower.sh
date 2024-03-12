#!/bin/bash
set -e

echo "Starting celery beat service..."

pdm run celery -A config flower --address='0.0.0.0' --port=80
