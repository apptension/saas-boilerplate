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

mkdir "${BACKEND_DIR}"
cd "${BACKEND_DIR}"
git clone https://github.com/apptension/django-restauth.git --branch feature/aws-boilerplate-sync --single-branch .
rm -rf .git
cd ../../
git add "${BACKEND_DIR}"

make setup
rm setup.sh
