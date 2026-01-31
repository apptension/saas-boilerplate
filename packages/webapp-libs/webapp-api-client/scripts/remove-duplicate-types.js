/**
 * Remove duplicate type definitions from generated GraphQL types.
 * 
 * GraphQL Codegen's client preset generates both schema types and document types.
 * When a mutation return type has the same name as the document type, we get duplicates.
 * 
 * NOTE: We renamed operations to avoid conflicts (e.g., BulkDeleteRevenueLines -> BulkDeleteRevenueLinesOp)
 * so there should be no more duplicates. This script now just validates that there are no duplicates.
 */

const fs = require('fs');
const path = require('path');

const graphqlFilePath = path.resolve(__dirname, '../src/graphql/__generated/gql/graphql.ts');

function findDuplicateTypes(content) {
  const typePattern = /export type (\w+) =/g;
  const types = {};
  const duplicates = [];
  let match;

  while ((match = typePattern.exec(content)) !== null) {
    const typeName = match[1];
    if (types[typeName]) {
      duplicates.push(typeName);
    } else {
      types[typeName] = true;
    }
  }

  return duplicates;
}

try {
  console.log('🔍 Checking for duplicate GraphQL types...');
  
  if (!fs.existsSync(graphqlFilePath)) {
    console.log('⚠️  GraphQL types file not found, skipping duplicate check');
    process.exit(0);
  }

  const content = fs.readFileSync(graphqlFilePath, 'utf8');
  const duplicates = findDuplicateTypes(content);

  if (duplicates.length > 0) {
    console.log('⚠️  Found duplicate types:', duplicates.join(', '));
    console.log('   Consider renaming operations to avoid conflicts (e.g., add "Op" suffix)');
  } else {
    console.log('✓ No duplicate types found');
  }
} catch (error) {
  console.error('❌ Error checking duplicate types:', error.message);
  process.exit(1);
}
