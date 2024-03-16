#!/bin/bash
set -e

echo "Starting celery worker – default queue..."

pdm run celery -A config worker -l info
