import { DeepMap, FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { PayloadError } from 'relay-runtime';
import { FormSubmitError } from '../../services/api/types';
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

export type GraphQLValidationError<FormData extends FieldValues = FieldValues> = PayloadError & {
  extensions: FormSubmitError<FormData>;
};

export type GraphQLGenericError = PayloadError & {
  extensions?: { readonly code: string; readonly message: string };
};

export type ApiFormReturnType<FormData extends FieldValues = FieldValues> = Omit<
  ReturnType<typeof useApiForm>,
  'register' | 'control'
> &
  UseFormReturn<FormData>;
