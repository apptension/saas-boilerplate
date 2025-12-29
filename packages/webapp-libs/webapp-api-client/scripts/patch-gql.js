#!/usr/bin/env node
/**
 * Post-generation script to ensure gql.ts throws helpful errors for missing queries
 * 
 * This script ensures that if a GraphQL query is not found in the documents map,
 * a helpful error is thrown instead of returning an empty object.
 * 
 * Run this after: pnpm nx run webapp-api-client:graphql:generate-types
 */

const fs = require('fs');
const path = require('path');

const gqlFilePath = path.resolve(__dirname, '../src/graphql/__generated/gql/gql.ts');

if (!fs.existsSync(gqlFilePath)) {
  console.error(`Error: gql.ts file not found at ${gqlFilePath}`);
  process.exit(1);
}

let content = fs.readFileSync(gqlFilePath, 'utf8');

// Replace the default fallback with an error-throwing version
const gqlFunctionPattern = /export function gql\(source: string\) \{\s*return \(documents as any\)\[source\] \?\? \{\};\s*\}/s;
const newGqlFunction = `export function gql(source: string) {
  const document = (documents as any)[source];
  if (!document) {
    throw new Error(
      \`GraphQL query not found in documents map. Please run: pnpm nx run webapp-api-client:graphql:generate-types\\n\\nQuery:\\n\${source.substring(0, 200)}...\`
    );
  }
  return document;
}`;

if (gqlFunctionPattern.test(content)) {
  content = content.replace(gqlFunctionPattern, newGqlFunction);
  fs.writeFileSync(gqlFilePath, content, 'utf8');
  console.log('✓ Updated gql.ts to throw helpful errors for missing queries');
} else {
  // Check if already updated
  if (content.includes('GraphQL query not found in documents map')) {
    console.log('✓ gql.ts already updated');
  } else {
    console.warn('Warning: Could not find gql function to update');
  }
}
