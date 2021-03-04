import { useForm, FieldName } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isNil, keys } from 'ramda';
import { ApiFormSubmitResponse, FormSubmitError } from '../../services/api/types';
import { UseApiFormArgs } from './useApiForm.types';
import { useTranslatedErrors } from './useTranslatedErrors';

export const useApiForm = <FormData extends Record<string, any>>(args?: UseApiFormArgs<FormData>) => {
  const [genericError, setGenericError] = useState<string>();
  const { translateErrorMessage } = useTranslatedErrors(args?.errorMessages);

  const formControls = useForm<FormData>(args);
  const { setError } = formControls;

  const setResponseErrors = useCallback(
    (response: FormSubmitError<FormData>) => {
      if (response.nonFieldErrors) {
        setGenericError(translateErrorMessage(response.nonFieldErrors[0]));
      }

      keys(response).forEach((field) => {
        if (field !== 'isError' && field !== 'nonFieldErrors') {
          const message = response[field]?.[0];
          if (!isNil(message)) {
            setError(field as FieldName<FormData>, { message: translateErrorMessage(message) });
          }
        }
      });
    },
    [setError, translateErrorMessage]
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
    setGenericError,
    handleSubmit,
    formState: Object.assign(formControls.formState, {
      isSubmitSuccessful: formControls.formState.isSubmitSuccessful && !genericError,
    }),
  };
};
