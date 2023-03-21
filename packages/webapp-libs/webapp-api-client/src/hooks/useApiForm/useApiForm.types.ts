import { DeepMap, FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';

import { FormSubmitError } from '../../api/types';
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

type UseApiFormWrapper<FormData extends FieldValues = FieldValues> = {
  wrapped: (e: FormData) => ReturnType<typeof useApiForm>;
};

export type ApiFormReturnType<FormData extends FieldValues = FieldValues> = ReturnType<
  UseApiFormWrapper<FormData>['wrapped']
> & { form: UseFormReturn<FormData, object> };
