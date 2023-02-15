import { useMutation, useQuery } from '@apollo/client';
import { pipe, pluck } from 'ramda';
import { useMemo } from 'react';

import { useMappedConnection } from '../useMappedConnection';
import {
  useFavoriteDemoItemFragment,
  useFavoriteDemoItemListCreateMutation,
  useFavoriteDemoItemListDeleteMutation,
  useFavoriteDemoItemListQuery,
} from './useFavoriteDemoItem.graphql';

export const useFavoriteDemoItem = (id: string) => {
  const handleCreate = useHandleCreate();
  const handleDelete = useHandleDelete();

  const { data } = useQuery(useFavoriteDemoItemListQuery, { fetchPolicy: 'cache-and-network' });

  const getIds = pipe<any, any, string[]>(pluck('item'), pluck('pk'));
  const favorites = useMappedConnection(data?.allContentfulDemoItemFavorites);
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
  const [commitCreateMutation] = useMutation(useFavoriteDemoItemListCreateMutation, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          allContentfulDemoItemFavorites(existingConnection = { edges: [] }) {
            const node = data?.createFavoriteContentfulDemoItem?.contentfulDemoItemFavoriteEdge?.node;
            if (!node) return existingConnection;

            const normalizedId = cache.identify({ id: node.id, __typename: 'ContentfulDemoItemFavoriteType' });

            const isAlreadyInStore = existingConnection.edges.some(({ node }) => node.id === normalizedId);
            if (isAlreadyInStore) return existingConnection;

            const newItem = {
              node: cache.writeFragment({
                id: normalizedId,
                data: node,
                fragment: useFavoriteDemoItemFragment,
              }),
              __typename: 'contentfulDemoItemFavoriteEdge',
            };

            return { ...existingConnection, edges: [...existingConnection.edges, newItem] };
          },
        },
      });
    },
  });

  return async (id: string) => {
    return await commitCreateMutation({
      variables: {
        input: {
          item: id,
        },
      },
    });
  };
};

export const useHandleDelete = () => {
  const [commitDeleteMutation] = useMutation(useFavoriteDemoItemListDeleteMutation, {
    update(cache, { data }) {
      const deletedId = data?.deleteFavoriteContentfulDemoItem?.deletedIds?.[0];
      const normalizedId = cache.identify({ id: deletedId, __typename: 'ContentfulDemoItemFavoriteType' });

      cache.evict({ id: normalizedId });
    },
  });

  return async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          item: id,
        },
      },
    });
  };
};
