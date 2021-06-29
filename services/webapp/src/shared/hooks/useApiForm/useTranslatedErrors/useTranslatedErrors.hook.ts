import { useCallback, useState } from 'react';
import { FieldValues, Path } from 'react-hook-form';
import { path } from 'ramda';
import { ErrorMessages, FieldErrorMessages } from '../useApiForm.types';
import { FieldError } from '../../../services/api/types';

export const useTranslatedErrors = <FormData extends FieldValues = FieldValues>(
  initialCustomMessages?: ErrorMessages<FormData>
) => {
  const [customMessages] = useState(initialCustomMessages);

  const translateErrorMessage = useCallback(
    (field: Path<FormData> | 'nonFieldErrors', error?: FieldError) => {
      if (!error) {
        return '';
      }

      const fallbackMessage = error.message || error.code;
      if (!customMessages) {
        return fallbackMessage;
      }

      const msg = path<FieldErrorMessages>(field.split('.'), customMessages);
      return msg?.[error.code] ?? fallbackMessage;
    },
    [customMessages]
  );
  return { translateErrorMessage };
};
