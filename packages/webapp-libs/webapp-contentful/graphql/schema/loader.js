const { readFileSync } = require('fs');
const { buildSchema } = require('graphql');

module.exports = function (schemaString) {
  return buildSchema(readFileSync(schemaString, { encoding: 'utf-8' }));
};
