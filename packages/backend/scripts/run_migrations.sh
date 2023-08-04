#!/bin/bash

/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./manage.py migrate
/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./manage.py init_subscriptions
/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./manage.py init_customers_plans
