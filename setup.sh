#!/bin/sh

set -e

BACKEND_DIR=services/backend

rm ".awsboilerplate.json"
cd scripts
npm install

cd setup
node ../node_modules/.bin/plop config

cd ../../

cp ${BACKEND_DIR}/.env.example ${BACKEND_DIR}/.env

make setup
rm setup.sh
