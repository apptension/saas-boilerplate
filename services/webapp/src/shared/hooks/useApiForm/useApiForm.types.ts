import { UseFormOptions } from 'react-hook-form/dist/types';
import { DeepMap, FieldValues } from 'react-hook-form';

export type FieldErrorMessages = Record<string, string>;

export type ErrorMessages<FormData extends FieldValues = FieldValues> = DeepMap<
  Partial<FormData>,
  FieldErrorMessages
> & {
  nonFieldErrors?: FieldErrorMessages;
};

export type UseApiFormArgs<FormData extends FieldValues = FieldValues> = UseFormOptions<FormData> & {
  errorMessages?: ErrorMessages<FormData>;
};

export type GraphQLResponseError = {
  readonly field: string;
  readonly messages: ReadonlyArray<{ readonly code: string; readonly message: string } | null> | null;
} | null;
