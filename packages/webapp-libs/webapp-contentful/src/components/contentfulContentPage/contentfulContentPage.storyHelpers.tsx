import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';

import { configContentfulAppQuery } from '../../config/config.graphql';
import { appConfigFactory, fillContentfulAppConfigQuery } from '../../tests/factories';

export const networkErrorMock: MockedResponse = {
  request: { query: configContentfulAppQuery },
  error: new Error('Failed to fetch'),
};

export const graphqlErrorMock: MockedResponse = {
  request: { query: configContentfulAppQuery },
  result: {
    errors: [new GraphQLError('Unable to fetch content from Contentful')],
  },
};

export const createContentfulPageMocks = (
  contentField: 'termsAndConditions' | 'privacyPolicy',
  sampleContent: string,
  emptyContent: string | null
) => ({
  default: (defaultMocks: readonly MockedResponse[]) =>
    defaultMocks.concat([
      fillContentfulAppConfigQuery({
        items: [appConfigFactory({ [contentField]: sampleContent } as any)],
        limit: 1,
        skip: 0,
        total: 1,
      }),
    ]),
  loading: (defaultMocks: readonly MockedResponse[]) =>
    defaultMocks.concat([
      {
        ...fillContentfulAppConfigQuery({
          items: [appConfigFactory({ [contentField]: sampleContent } as any)],
          limit: 1,
          skip: 0,
          total: 1,
        }),
        delay: Infinity,
      },
    ]),
  empty: (defaultMocks: readonly MockedResponse[]) =>
    defaultMocks.concat([
      fillContentfulAppConfigQuery({
        items: [appConfigFactory({ [contentField]: emptyContent } as any)],
        limit: 1,
        skip: 0,
        total: 1,
      }),
    ]),
  notConfigured: (defaultMocks: readonly MockedResponse[]) => defaultMocks.concat([networkErrorMock]),
  withError: (defaultMocks: readonly MockedResponse[]) => defaultMocks.concat([graphqlErrorMock]),
});
