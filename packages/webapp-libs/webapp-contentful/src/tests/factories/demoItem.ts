import { ContentfulDemoItemFavoriteType, DemoItem } from '@sb/webapp-api-client';
import {
  UseFavoriteDemoItemListCreateMutationMutation,
  UseFavoriteDemoItemListDeleteMutationMutation,
} from '@sb/webapp-api-client/graphql';
import {
  composeMockedListQueryResult,
  composeMockedNestedListQueryResult,
  composeMockedQueryResult,
  createDeepFactory,
  makeId,
} from '@sb/webapp-api-client/tests/utils';
import { times } from 'ramda';

import {
  useFavoriteDemoItemListCreateMutation,
  useFavoriteDemoItemListDeleteMutation,
  useFavoriteDemoItemListQuery,
} from '../../hooks/useFavoriteDemoItem/useFavoriteDemoItem.graphql';
import { demoItemQuery } from '../../routes/demoItem/demoItem.graphql';
import { demoItemsAllQuery } from '../../routes/demoItems/demoItems.graphql';
import { contentfulSysFactory } from './helpers';

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

export const demoItemFactory = createDeepFactory<DemoItem>(() => ({
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
