#!/bin/bash

export $(egrep -v '^#' .env | xargs)

if [ -z "$VITE_CONTENTFUL_SPACE" ] || [ "$VITE_CONTENTFUL_SPACE" == "<CHANGE_ME>" ]; then
    echo "VITE_CONTENTFUL_SPACE has not been set. Skipping..."
    exit 0
fi

if [ -z "$VITE_CONTENTFUL_ENV" ] || [ "$VITE_CONTENTFUL_ENV" == "<CHANGE_ME>" ]; then
    echo "VITE_CONTENTFUL_ENV has not been set. Skipping..."
    exit 0
fi

if [ -z "$VITE_CONTENTFUL_TOKEN" ] || [ "$VITE_CONTENTFUL_TOKEN" == "<CHANGE_ME>" ]; then
    echo "VITE_CONTENTFUL_TOKEN has not been set. Skipping..."
    exit 0
fi

CONTENTFUL_URL="https://graphql.contentful.com/content/v1/spaces/$VITE_CONTENTFUL_SPACE/environments/$VITE_CONTENTFUL_ENV?access_token=$VITE_CONTENTFUL_TOKEN"

rm  -f ./src/contentful/__generated/types.ts
rm  -f ./src/contentful/__generated/hooks.ts

./node_modules/.bin/rover graph introspect "$CONTENTFUL_URL" --output graphql/schema/contentful.graphql
