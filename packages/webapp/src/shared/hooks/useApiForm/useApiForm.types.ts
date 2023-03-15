import { FormSubmitError } from '@sb/webapp-api-client/api/types';
import { DeepMap, FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';

import { useApiForm } from './useApiForm.hook';

export type FieldErrorMessages = Record<string, string>;

export type ErrorMessages<FormData extends FieldValues = FieldValues> = DeepMap<
  Partial<FormData>,
  FieldErrorMessages
> & {
  nonFieldErrors?: FieldErrorMessages;
};

export type UseApiFormArgs<FormData extends FieldValues = FieldValues> = UseFormProps<FormData> & {
  errorMessages?: ErrorMessages<FormData>;
};

export type GraphQLValidationError<FormData extends FieldValues = FieldValues> = {
  message: string;
  extensions: FormSubmitError<FormData>;
};

class UseApiFormWrapper<FormData extends FieldValues = FieldValues> {
  wrapped(e: FormData) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useApiForm<FormData>();
  }
}

export type ApiFormReturnType<FormData extends FieldValues = FieldValues> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  ReturnType<UseApiFormWrapper<FormData>['wrapped']> & { form: UseFormReturn<FormData, object> };
