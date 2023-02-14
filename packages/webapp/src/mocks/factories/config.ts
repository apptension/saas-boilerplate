import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import configContentfulAppConfigQueryGraphql from '../../modules/config/__generated__/configContentfulAppConfigQuery.graphql';
import { CONFIG_CONTENTFUL_APP_CONFIG_QUERY } from '../../modules/config/config.graphql';
import { ContentfulAppConfig, ContentfulAppConfigCollection } from '../../shared/services/contentful';
import { composeMockedQueryResult } from '../../tests/utils/fixtures';
import { createDeepFactory } from './factoryCreators';

export const appConfigFactory = createDeepFactory<ContentfulAppConfig>(() => ({
  privacyPolicy: 'Lorem ipsum privacy policy',
  termsAndConditions: 'Lorem ipsum terms and conditions',
  sys: { id: 'test-id', environmentId: 'test', spaceId: 'test' },
  contentfulMetadata: { tags: [] },
  name: 'Global App Config',
}));

export const fillContentfulAppConfigQuery = (
  relayEnvironment?: RelayMockEnvironment,
  appConfigCollection: ContentfulAppConfigCollection
) => {
  if (relayEnvironment) {
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        AppConfigCollection: () => appConfigCollection,
      })
    );
    relayEnvironment.mock.queuePendingOperation(configContentfulAppConfigQueryGraphql, {});
  }
  return composeMockedQueryResult(CONFIG_CONTENTFUL_APP_CONFIG_QUERY, {
    data: {
      appConfigCollection,
    },
  });
};
