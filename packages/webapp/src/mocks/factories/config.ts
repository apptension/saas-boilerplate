import { configContentfulAppQuery } from '../../modules/config/config.graphql';
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

export const fillContentfulAppConfigQuery = (appConfigCollection: ContentfulAppConfigCollection) => {
  return composeMockedQueryResult(configContentfulAppQuery, {
    data: {
      appConfigCollection,
    },
  });
};
