import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import { useApiForm } from '../useApiForm.hook';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { UseApiFormArgs } from '../useApiForm.types';

interface TestFormFields {
  email: string;
}

describe('useApiForm: Hook', () => {
  const render = (args?: UseApiFormArgs<TestFormFields>) =>
    renderHook(() => useApiForm<TestFormFields>(args), {
      wrapper: ({ children }) => <ProvidersWrapper>{children}</ProvidersWrapper>,
    });

  it('should set generic form error from api response', () => {
    const { result } = render();
    const { setApiResponse } = result.current;
    act(() => {
      setApiResponse({ isError: true, nonFieldErrors: [{ message: 'custom error', code: 'custom-error' }] });
    });

    expect(result.current.genericError).toEqual('custom error');
    expect(result.current.errors).toEqual({});
  });

  it('should set field error from api response', () => {
    const { result } = render();
    const { setApiResponse } = result.current;
    act(() => {
      setApiResponse({ isError: true, email: [{ message: 'custom email error', code: 'custom-email-error' }] });
    });

    expect(result.current.genericError).toBeUndefined();
    expect(result.current.errors).toEqual({ email: { message: 'custom email error' } });
  });

  describe('custom error messages are provided', () => {
    it('should set field error from api response using custom translations', () => {
      const { result } = render({ errorMessages: { email: { custom_error: 'my custom error text' } } });
      const { setApiResponse } = result.current;
      act(() => {
        setApiResponse({ isError: true, email: [{ message: '', code: 'custom_error' }] });
      });

      expect(result.current.genericError).toBeUndefined();
      expect(result.current.errors).toEqual({ email: { message: 'my custom error text' } });
    });

    it('should set generic error from api response using custom translations', () => {
      const { result } = render({ errorMessages: { nonFieldErrors: { custom_error: 'my custom error text' } } });
      const { setApiResponse } = result.current;
      act(() => {
        setApiResponse({ isError: true, nonFieldErrors: [{ message: '', code: 'custom_error' }] });
      });

      expect(result.current.genericError).toEqual('my custom error text');
      expect(result.current.errors).toEqual({});
    });
  });
});
