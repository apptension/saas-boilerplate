import { renderHook, act } from '@testing-library/react-hooks';
import { useApiForm } from '../useApiForm.hook';

interface TestFormFields {
  email: string;
}

describe('useApiForm: Hook', () => {
  it('set generic form error from api response', () => {
    const { result } = renderHook(() => useApiForm<TestFormFields>());
    const { setResponseErrors } = result.current;
    act(() => {
      setResponseErrors({ nonFieldErrors: ['custom error'] });
    });

    expect(result.current.genericError).toEqual('custom error');
    expect(result.current.errors).toEqual({});
  });

  it('set field error from api response', () => {
    const { result } = renderHook(() => useApiForm<TestFormFields>());
    const { setResponseErrors } = result.current;
    act(() => {
      setResponseErrors({ email: ['custom email error'] });
    });

    expect(result.current.genericError).toBeUndefined();
    expect(result.current.errors).toEqual({ email: { message: 'custom email error' } });
  });
});
