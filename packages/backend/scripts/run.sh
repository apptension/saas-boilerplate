#!/bin/bash
set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source "${DIR}/manage_gunicorn_workers.sh"

echo Starting app server...

(sleep 5 && slow_start) &
pdm run gunicorn -c gunicorn.py config.wsgi:application
