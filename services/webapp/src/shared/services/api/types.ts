export * from './auth/types';

export type FieldErrors = string[];

export type FormSubmitError<T = unknown> = { [key in keyof T]?: FieldErrors } & { nonFieldErrors?: FieldErrors };

type ErrorFlag<T extends boolean> = { isError: T };

export type ApiFormSubmitResponse<Request, Response> =
  | (Response extends void ? ErrorFlag<false> : Response & ErrorFlag<false>)
  | (Request extends void ? ErrorFlag<true> : FormSubmitError<Request> & ErrorFlag<true>);
