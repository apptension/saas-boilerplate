import { renderHook } from '@testing-library/react-hooks';
import { useFavoriteDemoItem } from '../useFavoriteDemoItem.hook';
import { demoItemsActions } from '../../../../modules/demoItems';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: () => ['item-1', 'item-2'],
  };
});

describe('useFavoriteDemoItem: Hook', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should dispatch with correct parameters', () => {
    const { result } = renderHook(() => useFavoriteDemoItem('item-1'));
    result.current.setFavorite(false);
    expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: false }));
  });

  describe('item is favorited', () => {
    it('should return { isFavorite: true }', () => {
      const { result } = renderHook(() => useFavoriteDemoItem('item-1'));
      expect(result.current.isFavorite).toBe(true);
    });
  });

  describe('item is not favorited', () => {
    it('should return { isFavorite: false }', () => {
      const { result } = renderHook(() => useFavoriteDemoItem('item-999'));
      expect(result.current.isFavorite).toBe(false);
    });
  });
});
