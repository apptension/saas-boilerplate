import { times } from 'ramda';

import { demoItemQuery } from '../../routes/demoItem/demoItem.graphql';
import { demoItemsAllQuery } from '../../routes/demoItems/demoItems.graphql';
import {
  useFavoriteDemoItemListCreateMutation,
  useFavoriteDemoItemListDeleteMutation,
  useFavoriteDemoItemListQuery,
} from '../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.graphql';
import { ContentfulDemoItem } from '../../shared/services/contentful';
import { ContentfulDemoItemFavoriteType } from '../../shared/services/graphqlApi';
import {
  UseFavoriteDemoItemListCreateMutationMutation,
  UseFavoriteDemoItemListDeleteMutationMutation,
} from '../../shared/services/graphqlApi/__generated/gql/graphql';
import {
  composeMockedListQueryResult,
  composeMockedNestedListQueryResult,
  composeMockedQueryResult,
  makeId,
} from '../../tests/utils/fixtures';
import { createDeepFactory } from './factoryCreators';
import { contentfulSysFactory } from './helpers';

export const demoItemFactory = createDeepFactory<ContentfulDemoItem>(() => ({
  title: 'Demo item mock title',
  description: 'Demo item mock description',
  sys: contentfulSysFactory(),
  image: {
    sys: contentfulSysFactory(),
    title: 'Image title mock',
    description: '',
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

export const fillDemoItemQuery = (data = demoItemFactory(), variables = {}) => {
  return composeMockedQueryResult(demoItemQuery, {
    variables: { id: 'test-id' },
    data: { demoItem: data },
  });
};

export const fillDemoItemsAllQuery = (data = times(() => demoItemFactory(), 3)) => {
  return composeMockedNestedListQueryResult(demoItemsAllQuery, 'demoItemCollection', 'items', 'DemoItem', {
    data,
  });
};

export const fillUseFavouriteDemoItemListQuery = (data: Array<Partial<ContentfulDemoItemFavoriteType>> = []) => {
  return composeMockedListQueryResult(
    useFavoriteDemoItemListQuery,
    'allContentfulDemoItemFavorites',
    'UseFavoriteDemoItemListQueryQuery',
    {
      data,
    }
  );
};

export const fillRemoveFavouriteDemoItemQuery = (id: string, data: UseFavoriteDemoItemListDeleteMutationMutation) =>
  composeMockedQueryResult(useFavoriteDemoItemListDeleteMutation, {
    variables: { input: { item: id } },
    data,
  });

export const fillCreateFavouriteDemoItemQuery = (id: string, data: UseFavoriteDemoItemListCreateMutationMutation) =>
  composeMockedQueryResult(useFavoriteDemoItemListCreateMutation, {
    variables: { input: { item: id } },
    data: data,
  });
