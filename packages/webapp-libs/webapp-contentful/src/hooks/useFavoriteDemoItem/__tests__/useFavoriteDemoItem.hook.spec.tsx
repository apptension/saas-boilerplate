import { act } from '@testing-library/react-hooks';
import { append } from 'ramda';

import {
  contentfulDemoItemFavoriteFactory,
  fillRemoveFavouriteDemoItemQuery,
  fillUseFavouriteDemoItemListQuery,
} from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { useFavoriteDemoItem } from '../useFavoriteDemoItem.hook';

const allItems = [...Array(3)].map((_, i) =>
  contentfulDemoItemFavoriteFactory({
    id: `item-${i + 1}`,
    item: {
      pk: `item-${i + 1}`,
      __typename: 'ContentfulDemoItemType',
    },
    __typename: 'ContentfulDemoItemFavoriteType',
  })
);

describe('useFavoriteDemoItem: Hook', () => {
  it('should trigger correct mutation', async () => {
    const mockedItems = fillUseFavouriteDemoItemListQuery(allItems);

    const id = 'item-1';
    const mutationData = {
      deleteFavoriteContentfulDemoItem: {
        deletedIds: [id],
      },
    };
    const removeFavoriteItemMockResponse = fillRemoveFavouriteDemoItemQuery(id, mutationData);

    const { result, waitForApolloMocks } = renderHook(() => useFavoriteDemoItem(id), {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mockedItems, removeFavoriteItemMockResponse),
    });

    await waitForApolloMocks(1);

    await act(async () => {
      result.current.setFavorite(false);
    });

    // Wait for mutation to complete
    await waitForApolloMocks(2);
    expect(removeFavoriteItemMockResponse.result).toHaveBeenCalled();
  });

  describe('item is favorited', () => {
    it('should return { isFavorite: true }', async () => {
      const mockedItems = fillUseFavouriteDemoItemListQuery(allItems);

      const { result, waitForApolloMocks } = renderHook(() => useFavoriteDemoItem('item-2'), {
        apolloMocks: append(mockedItems),
      });

      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(true);
    });
  });

  describe('item is not favorited', () => {
    it('should return { isFavorite: false }', async () => {
      const mockedItems = fillUseFavouriteDemoItemListQuery(allItems);
      const { result, waitForApolloMocks } = renderHook(() => useFavoriteDemoItem('item-999'), {
        apolloMocks: append(mockedItems),
      });
      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(false);
    });
  });
});
