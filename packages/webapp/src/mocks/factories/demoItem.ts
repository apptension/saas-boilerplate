import { times } from 'ramda';
import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { ContentfulDemoItem } from '../../shared/services/contentful';
import { makeId, composeMockedQueryResult } from '../../tests/utils/fixtures';
import demoItemQueryGraphql from '../../routes/demoItem/__generated__/demoItemQuery.graphql';
import demoItemsAllQueryGraphql from '../../routes/demoItems/__generated__/demoItemsAllQuery.graphql';
import UseFavoriteDemoItemListQuery from '../../shared/hooks/useFavoriteDemoItem/__generated__/useFavoriteDemoItemListQuery.graphql';
import { ContentfulDemoItemFavoriteType } from '../../shared/services/graphqlApi';
import { demoItemQuery } from '../../routes/demoItem/demoItem.graphql';
import { createDeepFactory } from './factoryCreators';
import { contentfulSysFactory } from './helpers';

export const demoItemFactory = createDeepFactory<ContentfulDemoItem>(() => ({
  title: 'Demo item mock title',
  description: 'Demo item mock description',
  sys: contentfulSysFactory(),
  image: {
    sys: contentfulSysFactory(),
    title: 'Image title mock',
    url: `http://localhost/image/${makeId(32)}.png`,
    contentfulMetadata: { tags: [] },
  },
  contentfulMetadata: { tags: [] },
}));

export const contentfulDemoItemFavoriteFactory = createDeepFactory<Partial<ContentfulDemoItemFavoriteType>>(() => ({
  item: {
    contentfuldemoitemfavoriteSet: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    id: makeId(32),
    isPublished: false,
    fields: '',
  },
}));

export const fillDemoItemQuery = (data = demoItemFactory(), variables = {}, env?: RelayMockEnvironment) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        DemoItem() {
          return data;
        },
      })
    );
    env.mock.queuePendingOperation(demoItemQueryGraphql, variables);
  }

  return composeMockedQueryResult(demoItemQuery, {
    variables: { id: 'test-id' },
    data: { demoItem: data },
  });
};

export const fillDemoItemsAllQuery = (
  env: RelayMockEnvironment,
  data = { items: times(() => demoItemFactory(), 3) }
) => {
  env.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      DemoItemCollection() {
        return data;
      },
    })
  );
  env.mock.queuePendingOperation(demoItemsAllQueryGraphql, {});
};

export const fillUseFavouriteDemoItemListQuery = (
  env: RelayMockEnvironment,
  data: Partial<ContentfulDemoItemFavoriteType> = {}
) => {
  env.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      ContentfulDemoItemFavoriteType: () => data,
    })
  );
  env.mock.queuePendingOperation(UseFavoriteDemoItemListQuery, {});
};
