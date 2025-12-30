/**
 * Remove duplicate type definitions from generated GraphQL types.
 * 
 * GraphQL Codegen's client preset generates both schema types and document types.
 * When a mutation return type has the same name as the document type, we get duplicates.
 * This script removes the schema type definitions, keeping only the document types
 * (which are the ones actually used in the codebase).
 */

const fs = require('fs');
const path = require('path');

const graphqlFilePath = path.resolve(__dirname, '../src/graphql/__generated/gql/graphql.ts');

// Types that have duplicates (schema type vs document type)
const duplicateTypes = [
  'DeactivateSsoConnectionMutation',
  'RenamePasskeyMutation',
  'RevokeAllSessionsMutation',
  'RevokeScimTokenMutation',
  'RevokeSessionMutation',
];

function removeDuplicateSchemaTypes(content) {
  let lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is the start of a duplicate schema type definition
    const isDuplicateSchemaType = duplicateTypes.some(type => {
      // Match: export type TypeName = { (schema type format)
      // But NOT: export type TypeName = { __typename?: 'ApiMutation' (document type format)
      const schemaTypePattern = new RegExp(`^export type ${type} = \\{$`);
      const documentTypePattern = new RegExp(`^export type ${type} = \\{ __typename\\?`);
      
      return schemaTypePattern.test(line.trim()) && !documentTypePattern.test(line.trim());
    });

    if (isDuplicateSchemaType) {
      // Find which type this is
      const typeName = duplicateTypes.find(type => {
        const schemaTypePattern = new RegExp(`^export type ${type} = \\{$`);
        return schemaTypePattern.test(line.trim());
      });

      if (typeName) {
        // Skip the type declaration line (which includes the opening brace)
        i++;
        let braceCount = 1; // We already have the opening brace from the declaration line
        
        // Skip all lines until we find the matching closing brace
        while (i < lines.length && braceCount > 0) {
          const currentLine = lines[i];
          // Count braces in the current line
          for (const char of currentLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          i++;
        }
        
        // Skip any empty line after the closing brace
        if (i < lines.length && lines[i].trim() === '') {
          i++;
        }
        
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

try {
  console.log('🔍 Checking for duplicate GraphQL types...');
  
  if (!fs.existsSync(graphqlFilePath)) {
    console.log('⚠️  GraphQL types file not found, skipping duplicate removal');
    process.exit(0);
  }

  const content = fs.readFileSync(graphqlFilePath, 'utf8');
  const fixedContent = removeDuplicateSchemaTypes(content);

  if (content !== fixedContent) {
    fs.writeFileSync(graphqlFilePath, fixedContent, 'utf8');
    console.log('✓ Removed duplicate schema type definitions');
  } else {
    console.log('✓ No duplicate types found');
  }
} catch (error) {
  console.error('❌ Error removing duplicate types:', error.message);
  process.exit(1);
}
