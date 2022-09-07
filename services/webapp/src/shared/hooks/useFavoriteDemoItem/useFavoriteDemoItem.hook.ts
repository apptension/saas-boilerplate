import { useCallback, useEffect, useMemo } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery, usePreloadedQuery, useQueryLoader, UseQueryLoaderLoadQueryOptions } from 'react-relay';
import { pipe, pluck } from 'ramda';
import { ConnectionHandler } from 'relay-runtime';

import { usePromiseMutation } from '../../services/graphqlApi/usePromiseMutation';
import { useMappedConnection } from '../useMappedConnection';
import UseFavoriteDemoItemListQuery, {
  useFavoriteDemoItemListQuery,
} from './__generated__/useFavoriteDemoItemListQuery.graphql';
import { useFavoriteDemoItemListCreateMutation } from './__generated__/useFavoriteDemoItemListCreateMutation.graphql';
import { useFavoriteDemoItemListDeleteMutation } from './__generated__/useFavoriteDemoItemListDeleteMutation.graphql';

export const useFavoriteDemoItem = (id: string, queryRef: PreloadedQuery<useFavoriteDemoItemListQuery>) => {
  const handleCreate = useHandleCreate();
  const handleDelete = useHandleDelete();

  const data = usePreloadedQuery(UseFavoriteDemoItemListQuery, queryRef);
  const getIds = pipe<any, any, string[]>(pluck('item'), pluck('pk'));
  const favorites = useMappedConnection(data.allContentfulDemoItemFavorites);
  const favoritesIds = getIds(favorites);
  const isFavorite = useMemo(() => favoritesIds.includes(id), [id, favoritesIds]);

  const setFavorite = async (isFavorite: boolean) => {
    if (isFavorite) {
      await handleCreate(id);
    } else {
      await handleDelete(id);
    }
  };

  return {
    isFavorite,
    setFavorite,
  };
};

export const useHandleCreate = () => {
  const [commitCreateMutation] = usePromiseMutation<useFavoriteDemoItemListCreateMutation>(
    graphql`
      mutation useFavoriteDemoItemListCreateMutation(
        $input: CreateFavoriteContentfulDemoItemMutationInput!
        $connections: [ID!]!
      ) {
        createFavoriteContentfulDemoItem(input: $input) {
          contentfulDemoItemFavoriteEdge @appendEdge(connections: $connections) {
            node {
              ...useFavoriteDemoItem_item @relay(mask: false)
            }
          }
        }
      }
    `
  );

  return async (id: string) => {
    return await commitCreateMutation({
      variables: {
        input: {
          item: id,
        },
        connections: [
          ConnectionHandler.getConnectionID('root', 'useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites'),
        ],
      },
    });
  };
};

export const useHandleDelete = () => {
  const [commitDeleteMutation] = usePromiseMutation<useFavoriteDemoItemListDeleteMutation>(
    graphql`
      mutation useFavoriteDemoItemListDeleteMutation(
        $input: DeleteFavoriteContentfulDemoItemMutationInput!
        $connections: [ID!]!
      ) {
        deleteFavoriteContentfulDemoItem(input: $input) {
          deletedIds @deleteEdge(connections: $connections)
        }
      }
    `
  );

  return async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          item: id,
        },
        connections: [
          ConnectionHandler.getConnectionID('root', 'useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites'),
        ],
      },
    });
  };
};

graphql`
  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {
    item {
      pk
    }
  }
`;

export const useFavoriteDemoItemsLoader = () => {
  const [queryRef, loadQuery] = useQueryLoader<useFavoriteDemoItemListQuery>(
    graphql`
      query useFavoriteDemoItemListQuery {
        allContentfulDemoItemFavorites(first: 100)
          @connection(key: "useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites") {
          edges {
            node {
              ...useFavoriteDemoItem_item @relay(mask: false)
            }
          }
        }
      }
    `
  );

  const refresh = useCallback(
    (options: UseQueryLoaderLoadQueryOptions = { fetchPolicy: 'store-and-network' }) => {
      loadQuery({}, options);
    },
    [loadQuery]
  );

  useEffect(() => {
    refresh({ fetchPolicy: 'store-or-network' });
  }, [refresh]);

  return [queryRef, refresh] as const;
};
