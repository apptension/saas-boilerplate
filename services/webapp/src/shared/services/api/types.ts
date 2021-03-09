export * from './auth/types';

export type FieldError = {
  message?: string;
  code: string;
};

export type FieldErrors = FieldError[];

export type FormSubmitError<T = unknown> = { [key in keyof T]?: FieldErrors } & { nonFieldErrors?: FieldErrors };

type ErrorFlag<T extends boolean> = { isError: T };

export type ApiFormSubmitResponse<Request, Response> =
  | (Response extends void ? ErrorFlag<false> : Response & ErrorFlag<false>)
  | (Request extends void ? ErrorFlag<true> : FormSubmitError<Request> & ErrorFlag<true>);
