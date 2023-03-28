/**
 * This codegen.ts scans webapp-libs to find other graphql/codegen.ts files and merges them into
 * default configuration that already includes webapp-api-client and webapp itself.
 *
 * The merge is implemented as following: Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be recursively merged.
 * - and both associated values are also arrays then the values will be concatenated
 * - otherwise take the value from default config or just first found if doesn't exist in default config
 */
import * as fs from 'fs';
import * as path from 'path';

import { CodegenConfig } from '@graphql-codegen/cli';
import { mergeDeepWithKey, reduce } from 'ramda';

const webappLibsPath = path.resolve(__dirname, '../..');
const webappLibs = fs.readdirSync(webappLibsPath).filter((dirName) => dirName !== 'webapp-api-client');
const codegenConfigs = webappLibs
  .map((dirName) => path.resolve(webappLibsPath, dirName, 'graphql/codegen.ts'))
  .filter((codegenConfigPath) => fs.existsSync(codegenConfigPath))
  .map((codegenConfigPath) => require(codegenConfigPath));

const config: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  generates: {
    'src/graphql/__generated/gql/': {
      schema: {
        '../webapp-api-client/graphql/schema/api.graphql': {
          loader: '../webapp-api-client/graphql/schema/loader.js',
        },

        /*contentful*/
        '../webapp-contentful/graphql/schema/contentful.graphql': {
          loader: '../webapp-contentful/graphql/schema/loader.js',
        },
        /**/
      },
      documents: [
        '../webapp-api-client/src/**/*.ts',
        '../webapp-api-client/src/**/*.tsx',
        '!../webapp-api-client/src/graphql/**/__generated/*',
        '!../webapp-api-client/src/**/__generated__/*.graphql.ts',

        '../../webapp/src/**/*.ts',
        '../../webapp/src/**/*.tsx',
      ],

      config: {
        declarationKind: 'interface',
        maybeValue: 'T | undefined | null',
        namingConvention: {
          enumValues: 'change-case#upperCase',
        },
      },

      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
      },
    },
  },
};

const combinedConfigs = reduce(
  (acc, elem) =>
    mergeDeepWithKey(
      (key, a, b) => {
        if (Array.isArray(a)) {
          return a.concat(b);
        }
        return a;
      },
      acc,
      elem
    ),
  config,
  codegenConfigs
);

export default combinedConfigs;
