import { ContentfulDemoItemFavoriteType } from '@sb/webapp-api-client';
import {
  UseFavoriteDemoItemListCreateMutationMutation,
  UseFavoriteDemoItemListDeleteMutationMutation,
} from '@sb/webapp-api-client/graphql';
import { demoItemFactory } from '@sb/webapp-api-client/tests/factories';
import {
  composeMockedListQueryResult,
  composeMockedNestedListQueryResult,
  composeMockedQueryResult,
} from '@sb/webapp-api-client/tests/utils';
import { times } from 'ramda';

import { demoItemQuery } from '../../routes/demoItem/demoItem.graphql';
import { demoItemsAllQuery } from '../../routes/demoItems/demoItems.graphql';
import {
  useFavoriteDemoItemListCreateMutation,
  useFavoriteDemoItemListDeleteMutation,
  useFavoriteDemoItemListQuery,
} from '../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.graphql';

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
