import { renderHook } from '@testing-library/react';
import { useWebAuthn } from '../useWebAuthn';

describe('useWebAuthn', () => {
  describe('isSupported', () => {
    it('should return hook values', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(result.current).toHaveProperty('isSupported');
      expect(result.current).toHaveProperty('isRegistering');
      expect(result.current).toHaveProperty('isAuthenticating');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('registerPasskey');
      expect(result.current).toHaveProperty('authenticateWithPasskey');
    });

    it('should have registerPasskey as a function', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(typeof result.current.registerPasskey).toBe('function');
    });

    it('should have authenticateWithPasskey as a function', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(typeof result.current.authenticateWithPasskey).toBe('function');
    });

    it('should start with no error', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(result.current.error).toBeNull();
    });

    it('should start with isRegistering as false', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(result.current.isRegistering).toBe(false);
    });

    it('should start with isAuthenticating as false', () => {
      const { result } = renderHook(() => useWebAuthn());

      expect(result.current.isAuthenticating).toBe(false);
    });
  });
});
