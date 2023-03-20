#!/bin/bash

export $(egrep -v '^#' .env | xargs)

CONTENTFUL_URL="https://graphql.contentful.com/content/v1/spaces/$VITE_CONTENTFUL_SPACE/environments/$VITE_CONTENTFUL_ENV?access_token=$VITE_CONTENTFUL_TOKEN"

rm  -f ./src/contentful/__generated/types.ts
rm  -f ./src/contentful/__generated/hooks.ts

./node_modules/.bin/rover graph introspect "$CONTENTFUL_URL" --output graphql/schema/contentful.graphql
