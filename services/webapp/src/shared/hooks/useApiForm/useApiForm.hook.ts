import { Path, useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isEmpty, isNil, keys } from 'ramda';
import { PayloadError } from 'relay-runtime';
import { ApiFormSubmitResponse, FormSubmitError } from '../../services/api/types';
import { GraphQLValidationError, GraphQLGenericError, UseApiFormArgs } from './useApiForm.types';
import { useTranslatedErrors } from './useTranslatedErrors';

export const useApiForm = <FormData extends Record<string | number, any>>(args?: UseApiFormArgs<FormData>) => {
  const [genericError, setGenericError] = useState<string>();
  const { translateErrorMessage } = useTranslatedErrors<FormData>(args?.errorMessages);

  const formControls = useForm<FormData>(args);
  const { setError } = formControls;

  const setResponseErrors = useCallback(
    (response: FormSubmitError<FormData>) => {
      if (response.nonFieldErrors) {
        setGenericError(translateErrorMessage('nonFieldErrors', response.nonFieldErrors[0]));
      }

      keys(response).forEach((field) => {
        if (field !== 'isError' && field !== 'nonFieldErrors') {
          const message = response[field]?.[0];
          const fieldName = field as Path<FormData>;
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
        setResponseErrors(response);
      }
    },
    [setResponseErrors]
  );

  const handleSubmit: typeof formControls.handleSubmit = (onValid, onInvalid) => {
    return (event) => {
      formControls.clearErrors();
      setGenericError(undefined);
      return formControls.handleSubmit(onValid, onInvalid)(event);
    };
  };

  const hasGenericErrorOnly = isEmpty(formControls.formState.errors) && genericError !== undefined;

  return {
    ...formControls,
    genericError,
    setApiResponse,
    setGraphQLResponseErrors,
    setGenericError,
    hasGenericErrorOnly,
    handleSubmit,
    formState: {
      ...formControls.formState,
      isSubmitSuccessful: formControls.formState.isSubmitSuccessful && !genericError,
    },
  };
};
