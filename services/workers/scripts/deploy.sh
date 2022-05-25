#!/bin/bash

pdm sync --prod
node_modules/.bin/sls deploy --stage $ENV_STAGE
