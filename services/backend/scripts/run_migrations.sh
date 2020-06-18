#!/bin/bash

/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./manage.py migrate
