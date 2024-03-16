#!/bin/bash

set -e

pdm run watchmedo auto-restart \
  --directory=/app \
  --pattern=*.py \
  --recursive \
  -- pdm run celery -A config worker -l info
