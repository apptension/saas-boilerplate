const fs = require('fs');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { print } = require('graphql');

const schemaApi = fs.readFileSync('./graphql/schema/api.graphql.chunk', 'utf8');
const schemaCf = fs.readFileSync('./graphql/schema/contentful.graphql.chunk', 'utf8');

const typeDefs = mergeTypeDefs([schemaCf, schemaApi]);
const printedTypeDefs = print(typeDefs);

fs.writeFileSync('./graphql/schema/schema.graphql', printedTypeDefs);
