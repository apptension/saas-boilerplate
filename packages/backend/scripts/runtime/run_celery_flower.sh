#!/bin/bash
set -e

echo "Starting celery flower service..."

uv run celery -A config flower --address='0.0.0.0' --port=80
