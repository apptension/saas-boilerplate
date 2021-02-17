import { useForm, FieldName } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isNil, keys } from 'ramda';
import { UseFormOptions } from 'react-hook-form/dist/types';
import { ApiFormSubmitResponse, FormSubmitError } from '../../services/api/types';

export const useApiForm = <FormData extends Record<string, any>>(args?: UseFormOptions<FormData>) => {
  const [genericError, setGenericError] = useState<string>();

  const formControls = useForm<FormData>(args);
  const { setError } = formControls;

  const setResponseErrors = useCallback(
    (response: FormSubmitError<FormData>) => {
      if (response.nonFieldErrors) {
        setGenericError(response.nonFieldErrors[0]);
      }

      keys(response).forEach((field) => {
        if (field !== 'isError' && field !== 'nonFieldErrors') {
          const message = response[field]?.[0];
          if (!isNil(message)) {
            setError(field as FieldName<FormData>, { message });
          }
        }
      });
    },
    [setError]
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
    handleSubmit,
    formState: Object.assign(formControls.formState, {
      isSubmitSuccessful: formControls.formState.isSubmitSuccessful && !genericError,
    }),
  };
};
