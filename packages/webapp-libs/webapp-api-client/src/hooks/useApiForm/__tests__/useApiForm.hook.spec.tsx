import { act } from '@testing-library/react-hooks';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { renderHook } from '../../../tests/utils/rendering';
import { useApiForm } from '../useApiForm.hook';
import { UseApiFormArgs } from '../useApiForm.types';

interface TestFormFields {
  email: string;
}

describe('useApiForm: Hook', () => {
  const render = (args?: UseApiFormArgs<TestFormFields>) => renderHook(() => useApiForm<TestFormFields>(args));

  it('should set generic form error from api response', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();
    act(() => {
      result.current.setApolloGraphQLResponseErrors([
        new GraphQLError('GraphQlValidationError', {
          extensions: {
            nonFieldErrors: [{ message: 'custom error', code: 'custom-error' }],
          },
        }),
      ]);
    });

    expect(result.current.genericError).toEqual('custom error');
    expect(result.current.form.formState.errors).toEqual({});
  });

  it('should set field error from api response', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();
    act(() => {
      result.current.setApolloGraphQLResponseErrors([
        new GraphQLError('GraphQlValidationError', {
          extensions: {
            email: [{ message: 'custom email error', code: 'custom-email-error' }],
          },
        }),
      ]);
    });

    expect(result.current.genericError).toBeUndefined();
    expect(result.current.form.formState.errors).toEqual({ email: { message: 'custom email error' } });
  });

  describe('custom error messages are provided', () => {
    it('should set field error from api response using custom translations', async () => {
      const { result, waitForApolloMocks } = render({
        errorMessages: { email: { custom_error: 'my custom error text' } },
      });
      await waitForApolloMocks();
      act(() => {
        result.current.setApolloGraphQLResponseErrors([
          new GraphQLError('GraphQlValidationError', {
            extensions: {
              email: [{ message: '', code: 'custom_error' }],
            },
          }),
        ]);
      });

      expect(result.current.genericError).toBeUndefined();
      expect(result.current.form.formState.errors).toEqual({ email: { message: 'my custom error text' } });
    });

    it('should set generic error from api response using custom translations', async () => {
      const { result, waitForApolloMocks } = render({
        errorMessages: { nonFieldErrors: { custom_error: 'my custom error text' } },
      });
      await waitForApolloMocks();
      act(() => {
        result.current.setApolloGraphQLResponseErrors([
          new GraphQLError('GraphQlValidationError', {
            extensions: {
              nonFieldErrors: [{ message: '', code: 'custom_error' }],
            },
          }),
        ]);
      });

      expect(result.current.genericError).toEqual('my custom error text');
      expect(result.current.form.formState.errors).toEqual({});
    });
  });

  describe('hasGenericErrorOnly utility flag', () => {
    it('should return false if no generic error at all', async () => {
      const { result, waitForApolloMocks } = render();
      await waitForApolloMocks();

      expect(result.current.hasGenericErrorOnly).toBe(false);
    });

    it('should return false if has some fields error', async () => {
      const { result, waitForApolloMocks } = render();
      await waitForApolloMocks();

      act(() => {
        result.current.setApolloGraphQLResponseErrors([
          new GraphQLError('GraphQlValidationError', {
            extensions: {
              nonFieldErrors: [{ message: '', code: 'custom_error' }],
              email: [{ message: '', code: 'custom_error' }],
            },
          }),
        ]);
      });

      expect(result.current.hasGenericErrorOnly).toBe(false);
    });

    it('should return true if has non field error only', async () => {
      const { result, waitForApolloMocks } = render();
      await waitForApolloMocks();

      act(() => {
        result.current.setApolloGraphQLResponseErrors([
          new GraphQLError('GraphQlValidationError', {
            extensions: {
              nonFieldErrors: [{ message: '', code: 'custom_error' }],
            },
          }),
        ]);
      });

      expect(result.current.hasGenericErrorOnly).toBe(true);
    });
  });
});
