#!/bin/bash

pdm install --prod
node_modules/.bin/sls deploy --stage $ENV_STAGE