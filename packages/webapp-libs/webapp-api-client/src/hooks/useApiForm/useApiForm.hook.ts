import { camelCaseKeys } from '@sb/webapp-core/utils';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { isEmpty, isNil, keys } from 'ramda';
import { useCallback, useState } from 'react';
import { FieldValues, Path, UseFormHandleSubmit, useForm } from 'react-hook-form';

import { FormSubmitError } from '../../api/types';
import { ApiFormReturnType, GraphQLValidationError, UseApiFormArgs } from './useApiForm.types';
import { useTranslatedErrors } from './useTranslatedErrors';

/**
 * A wrapper hook around a [`useForm`](https://react-hook-form.com/api/useform/) hook from `react-hook-form` library.
 *
 * In addition to full `react-hook-form` functionality it is able to transform GraphQL validation errors returned from
 * backend into proper field errors.
 *
 * Read more about working with this library in official [`react-hook-form`](https://react-hook-form.com/api/)
 * documentation.
 *
 * @param args An extension of `react-hook-form` [UseFormProps](https://react-hook-form.com/ts/#UseFormProps)
 *
 * @category hook
 *
 * @example
 * You can pass errors from GraphQL response to automatically populate `react-hook-form` errors.
 *
 *
 * ```ts
 * const { setApolloGraphQLResponseErrors } = useApiForm<LoginFormFields>();
 *
 * const [commitLoginMutation] = useMutation(authSignInMutation, {
 *   onError: (error) => {
 *     // highlight-next-line
 *     setApolloGraphQLResponseErrors(error.graphQLErrors);
 *   },
 * });
 *
 * const handleLogin = handleSubmit(async (data: LoginFormFields) => {
 *   const { errors } = await commitLoginMutation({
 *     variables: {
 *       input: data,
 *     },
 *   });
 *   if (errors) {
 *     // highlight-next-line
 *     setApolloGraphQLResponseErrors(errors);
 *   }
 * });
 *
 *
 * ```
 *
 * @example
 * You can pass custom label for generic non-field errors.
 *
 * ```ts
 * const { genericError } = useApiForm<LoginFormFields>({
 *   errorMessages: {
 *     nonFieldErrors: {
 *       no_active_account: intl.formatMessage({
 *         defaultMessage: 'Incorrect authentication credentials.',
 *         id: 'Login form / error / no active account',
 *       }),
 *       authentication_failed: intl.formatMessage({
 *         defaultMessage: 'Incorrect authentication credentials.',
 *         id: 'Login form / error / authentication failed',
 *       }),
 *     },
 *   },
 * });
 *
 * console.log(genericError);
 * ```
 */
export const useApiForm = <FormData extends FieldValues = FieldValues>(
  args?: UseApiFormArgs<FormData>
): ApiFormReturnType<FormData> => {
  const [genericError, setGenericError] = useState<string>();
  const { translateErrorMessage } = useTranslatedErrors<FormData>(args?.errorMessages);

  const form = useForm<FormData>(args);
  const { setError } = form;

  const setResponseErrors = useCallback(
    (unsafeResponse: FormSubmitError<FormData>) => {
      const response = camelCaseKeys(unsafeResponse) as FormSubmitError<FormData>;

      if (response['nonFieldErrors']) {
        setGenericError(translateErrorMessage('nonFieldErrors', response['nonFieldErrors'][0]));
      }

      keys(response).forEach((field) => {
        if (field !== 'isError' && field !== 'nonFieldErrors') {
          const message = response[field]?.[0];
          const fieldName = field as unknown as Path<FormData>;
          if (!isNil(message)) {
            // @ts-ignore
            setError(fieldName, { message: translateErrorMessage(fieldName, message) });
          }
        }
      });
    },
    [setError, translateErrorMessage]
  );

  const setApolloGraphQLResponseErrors = useCallback(
    (errors: ReadonlyArray<GraphQLError>) => {
      const validationError = errors.find(({ message }) => message === 'GraphQlValidationError') as
        | GraphQLValidationError<FormData>
        | undefined;

      if (validationError) {
        setResponseErrors(validationError.extensions);
      } else {
        setResponseErrors({
          nonFieldErrors: errors.map((error) => {
            return {
              message: (error.extensions?.['message'] ?? error['message']) as string,
              code: (error.extensions?.['code'] ?? error['message']) as string,
            };
          }),
        });
      }
    },
    [setResponseErrors]
  );

  const handleSubmit: UseFormHandleSubmit<FormData> = (onValid, onInvalid) => {
    return (event) => {
      form.clearErrors();
      setGenericError(undefined);
      return form.handleSubmit(onValid, onInvalid)(event);
    };
  };

  const hasGenericErrorOnly = isEmpty(form.formState.errors) && genericError !== undefined;

  return {
    form,
    genericError,
    setApolloGraphQLResponseErrors,
    setGenericError,
    hasGenericErrorOnly,
    handleSubmit,
    formState: {
      isSubmitSuccessful: form.formState.isSubmitSuccessful && !genericError,
    },
  };
};
