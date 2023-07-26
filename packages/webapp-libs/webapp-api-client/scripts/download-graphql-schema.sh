#!/bin/bash

export $(egrep -v '^#' .env | xargs)

API_URL="http://localhost:5001/api/graphql/"

rm  -f ./src/graphql/__generated/types.ts
rm  -f ./src/graphql/__generated/hooks.ts

pnpm rover graph introspect "$API_URL" --output graphql/schema/api.graphql
