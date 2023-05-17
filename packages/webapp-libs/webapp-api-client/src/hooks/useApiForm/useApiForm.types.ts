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

/**
 * This type is an extension of [`UseFormProps`](https://react-hook-form.com/ts/#UseFormProps) from `react-hook-form`;
 * it adds a definition for translations of error messages' codes returned from backend.
 */
export type UseApiFormArgs<FormData extends FieldValues = FieldValues> = UseFormProps<FormData> & {
  errorMessages?: ErrorMessages<FormData>;
};

export type GraphQLValidationError<FormData extends FieldValues = FieldValues> = {
  message: string;
  extensions: FormSubmitError<FormData>;
};

export type ApiFormReturnType<FormData extends FieldValues = FieldValues> = {
  /**
   * Value returned from `react-hook-form`'s `useForm` hook. Check
   * [official docs](https://react-hook-form.com/ts/#UseFormReturn) for more details.
   *
   */
  form: UseFormReturn<FormData, object>;
  /**
   * A wrapper function around `form.handleSubmit`
   */
  handleSubmit: UseFormHandleSubmit<FormData>;
  /**
   * A value set with `setGenericError`. It can be also populated with `setApolloGraphQLResponseErrors` when a non-field
   * error is found.
   */
  genericError?: string;
  /**
   * A function that processes GraphQL errors and uses `form.setError` and `setGenericError` to populate proper errors
   * in `react-hook-form` context.
   * @param errors
   */
  setApolloGraphQLResponseErrors: (errors: ReadonlyArray<GraphQLError>) => void;
  setGenericError: (genericError: string | undefined) => void;
  hasGenericErrorOnly: boolean;
  formState: {
    isSubmitSuccessful: boolean;
  };
};
