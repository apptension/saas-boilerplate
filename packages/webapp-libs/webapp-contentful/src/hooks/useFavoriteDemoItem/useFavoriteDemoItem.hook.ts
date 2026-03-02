import { useMutation, useQuery } from '@apollo/client/react';
import { useMappedConnection } from '@sb/webapp-core/hooks';
import { pipe, pluck } from 'ramda';
import { useMemo, useState } from 'react';

import {
  useFavoriteDemoItemFragment,
  useFavoriteDemoItemListCreateMutation,
  useFavoriteDemoItemListDeleteMutation,
  useFavoriteDemoItemListQuery,
} from './useFavoriteDemoItem.graphql';

export type UseFavoriteDemoItemResult = {
  isFavorite: boolean;
  isLoading: boolean;
  error: Error | null;
  setFavorite: (isFavorite: boolean) => Promise<void>;
};

export const useFavoriteDemoItem = (id: string): UseFavoriteDemoItemResult => {
  const { handleCreate, createLoading, createError } = useHandleCreate();
  const { handleDelete, deleteLoading, deleteError } = useHandleDelete();
  const [lastError, setLastError] = useState<Error | null>(null);

  const { data, error: queryError } = useQuery(useFavoriteDemoItemListQuery, {
    fetchPolicy: 'cache-and-network',
  });
  const getIds = pipe<any, any, string[]>(pluck('item'), pluck('pk'));
  const favorites = useMappedConnection(data?.allContentfulDemoItemFavorites);
  const favoritesIds = getIds(favorites);
  const isFavorite = useMemo(() => favoritesIds.includes(id), [id, favoritesIds]);

  const setFavorite = async (shouldBeFavorite: boolean) => {
    setLastError(null);
    try {
      if (shouldBeFavorite) {
        await handleCreate(id);
      } else {
        await handleDelete(id);
      }
    } catch (err) {
      if (err instanceof Error) {
        setLastError(err);
      }
      throw err;
    }
  };

  return {
    isFavorite,
    isLoading: createLoading || deleteLoading,
    error: lastError || createError || deleteError || queryError || null,
    setFavorite,
  };
};

export const useHandleCreate = () => {
  const [commitCreateMutation, { loading, error }] = useMutation(useFavoriteDemoItemListCreateMutation, {
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

  const handleCreate = async (id: string) => {
    return await commitCreateMutation({
      variables: {
        input: {
          item: id,
        },
      },
    });
  };

  return { handleCreate, createLoading: loading, createError: error };
};

export const useHandleDelete = () => {
  const [commitDeleteMutation, { loading, error }] = useMutation(useFavoriteDemoItemListDeleteMutation, {
    update(cache, { data }) {
      const deletedId = data?.deleteFavoriteContentfulDemoItem?.deletedIds?.[0];
      const normalizedId = cache.identify({ id: deletedId, __typename: 'ContentfulDemoItemFavoriteType' });
      cache.evict({ id: normalizedId });
    },
  });

  const handleDelete = async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          item: id,
        },
      },
    });
  };

  return { handleDelete, deleteLoading: loading, deleteError: error };
};
