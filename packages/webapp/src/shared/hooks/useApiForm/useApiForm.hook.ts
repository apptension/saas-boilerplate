import { FormSubmitError } from '@sb/webapp-api-client/api/types';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { isEmpty, isNil, keys } from 'ramda';
import { useCallback, useState } from 'react';
import { FieldValues, Path, useForm } from 'react-hook-form';

import { camelCaseKeys } from '../../utils/object';
import { GraphQLValidationError, UseApiFormArgs } from './useApiForm.types';
import { useTranslatedErrors } from './useTranslatedErrors';

export const useApiForm = <FormData extends FieldValues = FieldValues>(args?: UseApiFormArgs<FormData>) => {
  const [genericError, setGenericError] = useState<string>();
  const { translateErrorMessage } = useTranslatedErrors<FormData>(args?.errorMessages);

  const form = useForm<FormData>(args);
  const { setError } = form;

  const setResponseErrors = useCallback(
    (unsafeResponse: FormSubmitError<FormData>) => {
      const response = camelCaseKeys(unsafeResponse) as FormSubmitError<FormData>;

      if (response.nonFieldErrors) {
        setGenericError(translateErrorMessage('nonFieldErrors', response.nonFieldErrors[0]));
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
              message: (error.extensions?.message ?? error.message) as string,
              code: (error.extensions?.code ?? error.message) as string,
            };
          }),
        });
      }
    },
    [setResponseErrors]
  );

  const handleSubmit: typeof form.handleSubmit = (onValid, onInvalid) => {
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
