#!/bin/bash

URL="https://graphql.contentful.com/content/v1/spaces/$REACT_APP_CONTENTFUL_SPACE/environments/$REACT_APP_CONTENTFUL_ENV?access_token=$REACT_APP_CONTENTFUL_TOKEN"

yarn yarn apollo client:download-schema --endpoint="$URL" schema.graphql
yarn contentful:generate-types
