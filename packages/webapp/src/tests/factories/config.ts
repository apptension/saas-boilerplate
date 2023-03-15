import { ContentfulAppConfigCollection } from '@sb/webapp-api-client/contentful';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';

import { configContentfulAppQuery } from '../../modules/config/config.graphql';

export const fillContentfulAppConfigQuery = (appConfigCollection: ContentfulAppConfigCollection) => {
  return composeMockedQueryResult(configContentfulAppQuery, {
    data: {
      appConfigCollection,
    },
  });
};
