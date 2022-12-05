import { act } from '@testing-library/react-hooks';
import { useApiForm } from '../useApiForm.hook';
import { renderHook } from '../../../../tests/utils/rendering';
import { UseApiFormArgs } from '../useApiForm.types';

interface TestFormFields {
  email: string;
}

describe('useApiForm: Hook', () => {
  const render = (args?: UseApiFormArgs<TestFormFields>) => renderHook(() => useApiForm<TestFormFields>(args));

  it('should set generic form error from api response', () => {
    const { result } = render();
    act(() => {
      result.current.setApiResponse({
        isError: true,
        nonFieldErrors: [{ message: 'custom error', code: 'custom-error' }],
      });
    });

    expect(result.current.genericError).toEqual('custom error');
    expect(result.current.form.formState.errors).toEqual({});
  });

  it('should set field error from api response', () => {
    const { result } = render();
    act(() => {
      result.current.setApiResponse({
        isError: true,
        email: [{ message: 'custom email error', code: 'custom-email-error' }],
      });
    });

    expect(result.current.genericError).toBeUndefined();
    expect(result.current.form.formState.errors).toEqual({ email: { message: 'custom email error' } });
  });

  describe('custom error messages are provided', () => {
    it('should set field error from api response using custom translations', () => {
      const { result } = render({ errorMessages: { email: { custom_error: 'my custom error text' } } });
      act(() => {
        result.current.setApiResponse({ isError: true, email: [{ message: '', code: 'custom_error' }] });
      });

      expect(result.current.genericError).toBeUndefined();
      expect(result.current.form.formState.errors).toEqual({ email: { message: 'my custom error text' } });
    });

    it('should set generic error from api response using custom translations', () => {
      const { result } = render({ errorMessages: { nonFieldErrors: { custom_error: 'my custom error text' } } });
      act(() => {
        result.current.setApiResponse({ isError: true, nonFieldErrors: [{ message: '', code: 'custom_error' }] });
      });

      expect(result.current.genericError).toEqual('my custom error text');
      expect(result.current.form.formState.errors).toEqual({});
    });
  });

  describe('hasGenericErrorOnly utility flag', () => {
    it('should return false if no generic error at all', () => {
      const { result } = render();

      expect(result.current.hasGenericErrorOnly).toBe(false);
    });

    it('should return false if has some fields error', () => {
      const { result } = render();

      act(() => {
        result.current.setApiResponse({
          isError: true,
          nonFieldErrors: [{ message: '', code: 'custom_error' }],
          email: [{ message: '', code: 'custom_error' }],
        });
      });

      expect(result.current.hasGenericErrorOnly).toBe(false);
    });

    it('should return true if has non field error only', () => {
      const { result } = render();

      act(() => {
        result.current.setApiResponse({ isError: true, nonFieldErrors: [{ message: '', code: 'custom_error' }] });
      });

      expect(result.current.hasGenericErrorOnly).toBe(true);
    });
  });
});
