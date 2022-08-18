import { renderHook, act } from '@testing-library/react-hooks';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';
import { useFavoriteDemoItem } from '../useFavoriteDemoItem.hook';
import { ProvidersWrapper, ProvidersWrapperProps } from '../../../utils/testUtils';
import { generateRelayEnvironment } from '../useFavoriteDemoItem.fixtures';

const refresh = jest.fn();

const relayEnvironmentWrapper = (relayEnvironment: RelayMockEnvironment) => ({ children }: ProvidersWrapperProps) =>
  <ProvidersWrapper context={{ relayEnvironment }}>{children} </ProvidersWrapper>

const renderHookWithContext = (callback: () => ReturnType<typeof useFavoriteDemoItem>) => {
  const relayEnvironment = generateRelayEnvironment();
  const rendered = renderHook(callback, { wrapper: relayEnvironmentWrapper(relayEnvironment) });
  return {
    ...rendered,
    relayEnvironment
  }
}

describe('useFavoriteDemoItem: Hook', () => {
  it('should trigger correct mutation', async () => {
    const { result, relayEnvironment } = renderHookWithContext(() => useFavoriteDemoItem('item-1', refresh));
    act(() => {
      result.current.setFavorite(false);
      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('useFavoriteDemoItemListDeleteMutation');
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });
  });

  describe('item is favorited', () => {
    it('should return { isFavorite: true }', () => {
      const { result } = renderHookWithContext(() => useFavoriteDemoItem('item-1', refresh));
      expect(result.current.isFavorite).toBe(true);
    });
  });

  describe('item is not favorited', () => {
    it('should return { isFavorite: false }', () => {
      const { result } = renderHookWithContext(() => useFavoriteDemoItem('item-999', refresh));
      expect(result.current.isFavorite).toBe(false);
    });
  });
});
