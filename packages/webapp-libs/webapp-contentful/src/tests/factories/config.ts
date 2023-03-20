import { MockedResponse } from '@apollo/client/testing';
import { AppConfig, AppConfigCollection } from '@sb/webapp-api-client';
import { composeMockedQueryResult, createDeepFactory } from '@sb/webapp-api-client/tests/utils';

import { configContentfulAppQuery } from '../../config/config.graphql';

export const appConfigFactory = createDeepFactory<AppConfig>(() => ({
  privacyPolicy: 'Lorem ipsum privacy policy',
  termsAndConditions: 'Lorem ipsum terms and conditions',
  sys: { id: 'test-id', environmentId: 'test', spaceId: 'test' },
  contentfulMetadata: { tags: [] },
  name: 'Global App Config',
}));

export const fillContentfulAppConfigQuery: (appConfigCollection: AppConfigCollection) => MockedResponse = (
  appConfigCollection: AppConfigCollection
) =>
  composeMockedQueryResult(configContentfulAppQuery, {
    data: {
      appConfigCollection,
    },
  });
