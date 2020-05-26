#!/bin/sh

set -e

CONFIG_FILENAME=.awsboilerplate.json

npm install -g plop
cd scripts/setup
rm "${CONFIG_FILENAME}"
plop config

cd ../../
git add "${CONFIG_FILENAME}"
make setup
rm setup.sh
