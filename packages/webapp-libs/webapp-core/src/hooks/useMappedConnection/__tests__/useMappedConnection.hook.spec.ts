import { renderHook } from '@testing-library/react';

import { useMappedConnection } from '../useMappedConnection.hook';

describe('useMappedConnection: Hook', () => {
  it('should return passed value', () => {
    const { result } = renderHook(() =>
      useMappedConnection({
        edges: [
          null,
          {
            node: {
              id: 1,
            },
          },
          {
            node: {
              id: 2,
            },
          },
        ],
      })
    );

    expect(result.current).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
