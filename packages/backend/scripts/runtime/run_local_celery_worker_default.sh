#!/bin/bash

set -e

uv run watchmedo auto-restart \
  --directory=/app \
  --pattern=*.py \
  --recursive \
  -- uv run celery -A config worker -l info
