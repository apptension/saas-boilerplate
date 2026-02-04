#!/bin/bash
set -e

echo "Starting celery flower service..."

uv run celery -A config flower
