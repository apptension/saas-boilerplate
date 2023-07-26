#!/bin/bash
set -e

echo Starting app server...

pdm run gunicorn -c gunicorn.py config.wsgi:application
