import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import configContentfulAppConfigQueryGraphql from '../../modules/config/__generated__/configContentfulAppConfigQuery.graphql';
import { ContentfulAppConfig, ContentfulAppConfigCollection } from '../../shared/services/contentful';
import { createDeepFactory } from './factoryCreators';

export const appConfigFactory = createDeepFactory<ContentfulAppConfig>(() => ({
  privacyPolicy: 'Lorem ipsum privacy policy',
  termsAndConditions: 'Lorem ipsum terms and conditions',
  sys: { id: 'test-id', environmentId: 'test', spaceId: 'test' },
  contentfulMetadata: { tags: [] },
}));

export const fillContentfulAppConfigQuery = (
  relayEnvironment: RelayMockEnvironment,
  appConfigCollection: ContentfulAppConfigCollection
) => {
  relayEnvironment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      AppConfigCollection: () => appConfigCollection,
    })
  );
  relayEnvironment.mock.queuePendingOperation(configContentfulAppConfigQueryGraphql, {});
};
