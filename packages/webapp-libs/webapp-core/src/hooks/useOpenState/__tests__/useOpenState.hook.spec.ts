import { act, renderHook } from '@testing-library/react';

import { useOpenState } from '../useOpenState.hook';

describe('useOpenState: Hook', () => {
  it('should set default value', () => {
    const state = true;
    const { result } = renderHook(() => useOpenState(() => state));
    expect(result.current.isOpen).toBe(state);
  });

  it('should set isOpen to true on open action', () => {
    const { result } = renderHook(() => useOpenState(false));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should set isOpen to false on open action', () => {
    const { result } = renderHook(() => useOpenState(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should set isOpen to opposite value on toggle', () => {
    const { result } = renderHook(() => useOpenState(true));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
  });

  describe('clickAway', () => {
    it('should set isOpen to false if was already opened', () => {
      const { result } = renderHook(() => useOpenState(true));

      act(() => {
        result.current.clickAway();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('should do nothing if was not opened', () => {
      const { result } = renderHook(() => useOpenState(false));

      act(() => {
        result.current.clickAway();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('should do nothing after toggle action', () => {
      const { result } = renderHook(() => useOpenState(false));

      act(() => {
        result.current.toggle();
        result.current.clickAway();
      });
      expect(result.current.isOpen).toBe(true);
    });
  });
});
