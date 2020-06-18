#!/bin/sh

set -e

CONFIG_FILENAME=.awsboilerplate.json
BACKEND_DIR=services/backend

rm "${CONFIG_FILENAME}"
npm install -g plop
cd scripts/setup
plop config

cd ../../
git add "${CONFIG_FILENAME}"

cp ${BACKEND_DIR}/.env.example ${BACKEND_DIR}/.env

make setup
rm setup.sh
