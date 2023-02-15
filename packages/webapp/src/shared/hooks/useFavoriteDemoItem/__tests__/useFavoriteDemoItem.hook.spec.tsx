import { act } from '@testing-library/react-hooks';

import { fillRemoveFavouriteDemoItemQuery } from '../../../../mocks/factories';
import { composeMockedListQueryResult } from '../../../../tests/utils/fixtures';
import { renderHook } from '../../../../tests/utils/rendering';
import { generateRelayEnvironment } from '../useFavoriteDemoItem.fixtures';
import { useFavoriteDemoItemListQuery } from '../useFavoriteDemoItem.graphql';
import { useFavoriteDemoItem } from '../useFavoriteDemoItem.hook';

const allItems = [...Array(3)].map((_, i) => ({
  id: `item-${i + 1}`,
  item: {
    pk: `item-${i + 1}`,
    __typename: 'ContentfulDemoItemType',
  },
  __typename: 'ContentfulDemoItemFavoriteType',
}));

const mockItemsResponse = () => {
  return composeMockedListQueryResult(
    useFavoriteDemoItemListQuery,
    'allContentfulDemoItemFavorites',
    'UseFavoriteDemoItemListQueryQuery',
    {
      data: allItems,
    }
  );
};

const renderHookWithContext = (callback: () => ReturnType<typeof useFavoriteDemoItem>) => {
  const relayEnvironment = generateRelayEnvironment();
  const rendered = renderHook(callback, { relayEnvironment });
  return {
    ...rendered,
    relayEnvironment,
  };
};
describe('useFavoriteDemoItem: Hook', () => {
  it('should trigger correct mutation', async () => {
    const mockedItems = mockItemsResponse();
    const id = 'item-1';
    const mutationData = {
      deleteFavoriteContentfulDemoItem: {
        deletedIds: [id],
      },
    };
    const removeFavoriteItemMockResponse = fillRemoveFavouriteDemoItemQuery(id, mutationData);
    removeFavoriteItemMockResponse.newData = jest.fn(() => ({
      data: mutationData,
    }));

    const { result, waitForApolloMocks } = renderHook(() => useFavoriteDemoItem(id), {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mockedItems, removeFavoriteItemMockResponse),
    });

    await waitForApolloMocks(1);

    act(() => {
      result.current.setFavorite(false);
      expect(removeFavoriteItemMockResponse.newData).toHaveBeenCalled();
    });
  });

  describe('item is favorited', () => {
    it('should return { isFavorite: true }', async () => {
      const mockedItems = mockItemsResponse();

      const { result, waitForApolloMocks } = renderHook(() => useFavoriteDemoItem('item-2'), {
        apolloMocks: (defaultMocks) => defaultMocks.concat(mockedItems),
      });

      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(true);
    });
  });

  describe('item is not favorited', () => {
    it('should return { isFavorite: false }', async () => {
      const { result, waitForApolloMocks } = renderHookWithContext(() => useFavoriteDemoItem('item-3'));
      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(false);
    });
  });
});
