#!/bin/bash
set -e

echo Starting app server...

pdm run gunicorn -c python:config.gunicorn config.asgi:application
