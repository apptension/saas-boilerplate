#!/bin/bash
set -e

echo "Starting celery beat service..."

pdm run celery -A config flower
