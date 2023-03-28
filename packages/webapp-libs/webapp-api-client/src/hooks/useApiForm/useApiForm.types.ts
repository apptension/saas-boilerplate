import { GraphQLError } from 'graphql/error/GraphQLError';
import { DeepMap, FieldValues, UseFormHandleSubmit, UseFormProps, UseFormReturn } from 'react-hook-form';

import { FormSubmitError } from '../../api/types';

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

export type ApiFormReturnType<FormData extends FieldValues = FieldValues> = {
  form: UseFormReturn<FormData, object>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  genericError?: string;
  setApolloGraphQLResponseErrors: (errors: ReadonlyArray<GraphQLError>) => void;
  setGenericError: (genericError: string | undefined) => void;
  hasGenericErrorOnly: boolean;
  formState: {
    isSubmitSuccessful: boolean;
  };
};
