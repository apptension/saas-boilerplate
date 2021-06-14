import { FieldName, useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isNil, keys } from 'ramda';

import { ApiFormSubmitResponse, FormSubmitError } from '../../services/api/types';
import { GraphQLResponseError, UseApiFormArgs } from './useApiForm.types';
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
          const fieldName = field as FieldName<FormData>;
          if (!isNil(message)) {
            setError(fieldName, { message: translateErrorMessage(fieldName, message) });
          }
        }
      });
    },
    [setError, translateErrorMessage]
  );

  const setGraphQLResponseErrors = useCallback(
    (errors: ReadonlyArray<GraphQLResponseError | null>) => {
      const formErrors: FormSubmitError<FormData> = {};
      errors.forEach((error) => {
        if (error?.messages) {
          formErrors[error.field as 'nonFieldErrors' | keyof FormData] = error.messages.map((message) => ({
            code: message?.code ?? '',
            message: message?.message ?? '',
          }));
        }
      });

      setResponseErrors(formErrors);
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
    return (e) => {
      formControls.clearErrors();
      setGenericError(undefined);
      return formControls.handleSubmit(onValid, onInvalid)(e);
    };
  };

  return {
    ...formControls,
    genericError,
    setApiResponse,
    setGraphQLResponseErrors,
    setGenericError,
    handleSubmit,
    formState: Object.assign(formControls.formState, {
      isSubmitSuccessful: formControls.formState.isSubmitSuccessful && !genericError,
    }),
  };
};
