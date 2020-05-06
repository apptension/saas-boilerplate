#!/bin/sh
set -e

sh /app/scripts/await_db.sh

echo Starting app server...

gunicorn -c gunicorn.py backend.wsgi:application
