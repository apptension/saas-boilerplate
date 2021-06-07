#!/bin/sh

set -e

DIR="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"


BACKEND_DIR="${DIR}/services/backend"
SCRIPTS_DIR="${DIR}/scripts"

rm -rf ".awsboilerplate.json"
rm -rf ".awsboilerplate.dev.json"

cd "${SCRIPTS_DIR}" && npm install
cd "${SCRIPTS_DIR}/setup" && node ../node_modules/.bin/plop config

cp "${BACKEND_DIR}"/.env.example "${BACKEND_DIR}"/.env

cd "${DIR}"

make install
make setup-docker
