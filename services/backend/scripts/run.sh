#!/bin/bash
set -e

echo Starting app server...

gunicorn -c gunicorn.py restauth.wsgi:application
