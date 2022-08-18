import { useCallback, useEffect, useMemo } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery, UseQueryLoaderLoadQueryOptions, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { pipe, pluck } from 'ramda';
import UseFavoriteDemoItemListQuery, { useFavoriteDemoItemListQuery } from '../../../__generated__/useFavoriteDemoItemListQuery.graphql';
import { useMappedConnection } from '../useMappedConnection';
import { usePromiseMutation } from '../../services/graphqlApi/usePromiseMutation';
import { useFavoriteDemoItemListCreateMutation } from '../../../__generated__/useFavoriteDemoItemListCreateMutation.graphql';

export const useFavoriteDemoItem = (id: string, queryRef: PreloadedQuery<useFavoriteDemoItemListQuery>, refresh: (options?: UseQueryLoaderLoadQueryOptions) => void) => {
  const handleCreate = useHandleCreate();
  const handleDelete = useHandleDelete();

  const data = usePreloadedQuery<useFavoriteDemoItemListQuery>(UseFavoriteDemoItemListQuery, queryRef);
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
    refresh();
  };

  return {
    isFavorite,
    setFavorite,
  };
};

export const useHandleCreate = () => {
    const [commitCreateMutation] = usePromiseMutation<useFavoriteDemoItemListCreateMutation>(
      graphql`
        mutation useFavoriteDemoItemListCreateMutation($input: CreateFavoriteContentfulDemoItemMutationInput!)  {
          createFavoriteContentfulDemoItem(input: $input) {
            contentfulDemoItemFavorite {
              item {
                pk
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
          item: id
        }
      }
    })
  }
}

export const useHandleDelete = () => {
    const [commitDeleteMutation] = usePromiseMutation<useFavoriteDemoItemListCreateMutation>(
      graphql`
        mutation useFavoriteDemoItemListDeleteMutation($input: DeleteFavoriteContentfulDemoItemMutationInput!)  {
          deleteFavoriteContentfulDemoItem(input: $input) {
            deletedIds
          }
        }
      `
    );

  return async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          item: id
        }
      }
    })
  }
}

export const useFavoriteDemoItemsLoader = () => {
    const [queryRef, loadQuery] = useQueryLoader<useFavoriteDemoItemListQuery>(
      graphql`
        query useFavoriteDemoItemListQuery {
          allContentfulDemoItemFavorites {
            edges {
              node {
                item {
                  pk
                }
              }
            }
          }
        }
      `
    )

  const refresh = useCallback((options: UseQueryLoaderLoadQueryOptions = { fetchPolicy: 'store-and-network' }) => {
    loadQuery({}, options);
  }, [loadQuery])

  useEffect(() => {
    refresh({ fetchPolicy: 'store-or-network' });
  }, [refresh]);

  return [queryRef, refresh] as const;
}
