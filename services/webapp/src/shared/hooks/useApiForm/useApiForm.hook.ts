import { useForm, FieldName } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { isNil, keys } from 'ramda';
import { FormSubmitError } from '../../services/api/types';

export const useApiForm = <FormData>() => {
  const [genericError, setGenericError] = useState<string>();
  const formControls = useForm<FormData>();
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

  return { ...formControls, genericError, setResponseErrors };
};
