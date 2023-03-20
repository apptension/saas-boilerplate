const fs = require('fs');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { print } = require('graphql');

const schemaApi = fs.readFileSync('./graphql/schema/api.graphql', 'utf8');
const schemaCf = fs.readFileSync('./graphql/schema/contentful.graphql', 'utf8');

// replacing is needed because of the issue: https://github.com/ardatan/graphql-tools/issues/4366
const typeDefs = mergeTypeDefs([schemaCf, schemaApi.replaceAll('behaviour', 'behavior')]);
const printedTypeDefs = print(typeDefs);

fs.writeFileSync('./graphql/schema/schema.graphql', printedTypeDefs);
