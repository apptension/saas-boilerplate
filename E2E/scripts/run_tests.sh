#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

npx cypress run configFile=qa --browser chrome --headless
npm run generate:report
