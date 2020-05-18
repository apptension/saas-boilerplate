#!/bin/sh

set -e

npm install -g plop
cd scripts/setup
plop config

cd ../../
git add .awsboilerplate.json
make setup
