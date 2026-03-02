#!/bin/bash
set -e

echo "Starting app server..."
uv run gunicorn -c python:config.gunicorn config.asgi:application
