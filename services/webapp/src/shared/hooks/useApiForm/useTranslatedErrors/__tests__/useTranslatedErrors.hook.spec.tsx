import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useTranslatedErrors } from '../useTranslatedErrors.hook';
import { ProvidersWrapper } from '../../../../utils/testUtils';
import { ErrorMessages } from '../useTranslatedErrors.types';

describe('useTranslatedErrors: Hook', () => {
  const render = (args?: ErrorMessages) =>
    renderHook(() => useTranslatedErrors(args), {
      wrapper: ({ children }) => <ProvidersWrapper>{children}</ProvidersWrapper>,
    });

  describe('provided with no custom messages', () => {
    it('should return default translation if exists', () => {
      const { result } = render();
      expect(result.current.translateErrorMessage('INVALID_CREDENTIALS')).toBe(
        'Provided email or password is invalid.'
      );
    });

    it('should return input if no translation exists', () => {
      const { result } = render();
      expect(result.current.translateErrorMessage('NON_EXISTING_ERROR')).toBe('NON_EXISTING_ERROR');
    });
  });

  describe('provided with custom messages', () => {
    const customMessages = { CUSTOM_ERROR: 'custom error message' };

    it('should return default translation if exists', () => {
      const { result } = render(customMessages);
      expect(result.current.translateErrorMessage('CUSTOM_ERROR')).toBe('custom error message');
    });

    it('should use default translation if no custom was provided for given key', () => {
      const { result } = render(customMessages);
      expect(result.current.translateErrorMessage('INVALID_CREDENTIALS')).toBe(
        'Provided email or password is invalid.'
      );
    });

    it('should return input if no translation exists', () => {
      const { result } = render(customMessages);
      expect(result.current.translateErrorMessage('NON_EXISTING_ERROR')).toBe('NON_EXISTING_ERROR');
    });
  });
});
