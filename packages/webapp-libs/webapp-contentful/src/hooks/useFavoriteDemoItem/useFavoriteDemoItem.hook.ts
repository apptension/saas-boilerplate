import { useMutation, useQuery } from '@apollo/client';
import { useMappedConnection } from '@sb/webapp-core/hooks';
import { pipe, pluck } from 'ramda';
import { useMemo } from 'react';

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
      const node = data?.createFavoriteContentfulDemoItem?.contentfulDemoItemFavoriteEdge?.node;
      if (!node) {
        return;
      }
      const normalizedId = cache.identify({ id: node.id, __typename: 'ContentfulDemoItemFavoriteType' });
      const connection = cache.readQuery({ query: useFavoriteDemoItemListQuery });
      const isAlreadyInConnection = connection?.allContentfulDemoItemFavorites?.edges?.some(
        (edge) => edge?.node?.id === node?.id
      );
      if (isAlreadyInConnection) {
        return;
      }

      const newEdge = {
        node: cache.writeFragment({
          id: normalizedId,
          data: node,
          fragment: useFavoriteDemoItemFragment,
        }),
        __typename: 'ContentfulDemoItemFavoriteEdge',
      };

      cache.modify({
        fields: {
          allContentfulDemoItemFavorites(existingConnection) {
            return { ...existingConnection, edges: [...existingConnection.edges, newEdge] };
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
