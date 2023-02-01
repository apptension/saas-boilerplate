import { act } from '@testing-library/react-hooks';
import { MockPayloadGenerator } from 'relay-test-utils';
import { useFavoriteDemoItem } from '../useFavoriteDemoItem.hook';
import { renderHook } from '../../../../tests/utils/rendering';
import { generateRelayEnvironment } from '../useFavoriteDemoItem.fixtures';

const refresh = jest.fn();

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
    const { result, relayEnvironment, waitForApolloMocks } = renderHookWithContext(() =>
      useFavoriteDemoItem('item-1', refresh)
    );
    await waitForApolloMocks();
    act(() => {
      result.current.setFavorite(false);
      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('useFavoriteDemoItemListDeleteMutation');
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });
  });

  describe('item is favorited', () => {
    it('should return { isFavorite: true }', async () => {
      const { result, waitForApolloMocks } = renderHookWithContext(() => useFavoriteDemoItem('item-1', refresh));
      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(true);
    });
  });

  describe('item is not favorited', () => {
    it('should return { isFavorite: false }', async () => {
      const { result, waitForApolloMocks } = renderHookWithContext(() => useFavoriteDemoItem('item-999', refresh));
      await waitForApolloMocks();
      expect(result.current.isFavorite).toBe(false);
    });
  });
});
