import React from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { useCrudDemoItem } from '../useCrudDemoItem.hook';
import { crudDemoItemFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { prepareState } from '../../../../mocks/store';
import { crudDemoItemActions } from '../../../../modules/crudDemoItem';

const item = crudDemoItemFactory();
const items = [crudDemoItemFactory(), item, crudDemoItemFactory()];

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('useCrudDemoItem: Hook', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should return item value from store if present', () => {
    const store = prepareState((state) => {
      state.crudDemoItem.items = items;
    });
    const { result } = renderHook(() => useCrudDemoItem(item.id), {
      wrapper: ({ children }) => <ProvidersWrapper context={{ store }}>{children}</ProvidersWrapper>,
    });
    expect(result.current).toEqual(item);
  });

  it('should dispatch fetch action if item not present in the store', () => {
    const { result } = renderHook(() => useCrudDemoItem(item.id), {
      wrapper: ({ children }) => <ProvidersWrapper>{children}</ProvidersWrapper>,
    });
    expect(result.current).toEqual(undefined);
    expect(mockDispatch).toHaveBeenCalledWith(crudDemoItemActions.fetchCrudDemoItem(item.id));
  });
});
