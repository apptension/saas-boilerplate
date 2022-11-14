import { FieldValues, Path, useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isEmpty, isNil, keys } from 'ramda';
import humps from 'humps';
import { PayloadError } from 'relay-runtime';
import { ApiFormSubmitResponse, FormSubmitError } from '../../services/api/types';
import { GraphQLValidationError, GraphQLGenericError, UseApiFormArgs } from './useApiForm.types';
import { useTranslatedErrors } from './useTranslatedErrors';

export const useApiForm = <FormData extends FieldValues = FieldValues>(args?: UseApiFormArgs<FormData>) => {
  const [genericError, setGenericError] = useState<string>();
  const { translateErrorMessage } = useTranslatedErrors<FormData>(args?.errorMessages);

  const form = useForm<FormData>(args);
  const { setError } = form;

  const setResponseErrors = useCallback(
    (unsafeResponse: FormSubmitError<FormData>) => {
      const response = humps.camelizeKeys(unsafeResponse) as FormSubmitError<FormData>;

      if (response.nonFieldErrors) {
        setGenericError(translateErrorMessage('nonFieldErrors', response.nonFieldErrors[0]));
      }

      keys(response).forEach((field) => {
        if (field !== 'isError' && field !== 'nonFieldErrors') {
          const message = response[field]?.[0];
          const fieldName = field as unknown as Path<FormData>;
          if (!isNil(message)) {
            setError(fieldName, { message: translateErrorMessage(fieldName, message) });
          }
        }
      });
    },
    [setError, translateErrorMessage]
  );

  const setGraphQLResponseErrors = useCallback(
    (errors: PayloadError[]) => {
      const validationError = errors.find(({ message }) => message === 'GraphQlValidationError') as
        | GraphQLValidationError<FormData>
        | undefined;

      if (validationError) {
        setResponseErrors(validationError.extensions);
      } else {
        setResponseErrors({
          nonFieldErrors: errors.map((error) => {
            const genericError = error as GraphQLGenericError;
            return {
              message: genericError.extensions?.message ?? error.message,
              code: genericError.extensions?.code ?? error.message,
            };
          }),
        });
      }
    },
    [setResponseErrors]
  );

  const setApiResponse = useCallback(
    (response: ApiFormSubmitResponse<FormData, unknown>) => {
      if (response.isError) {
        const { isError, ...responseErrors } = response;
        setResponseErrors(responseErrors as unknown as FormSubmitError<FormData>);
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
    setApiResponse,
    setGraphQLResponseErrors,
    setGenericError,
    hasGenericErrorOnly,
    handleSubmit,
    formState: {
      isSubmitSuccessful: form.formState.isSubmitSuccessful && !genericError,
    },
  };
};
