import { AxiosRequestConfig } from 'axios';

export * from './auth/types';

export type FieldError = {
  message?: string;
  code: string;
};

export type FieldErrors = FieldError[];

export type FormSubmitError<T = unknown> = { [key in keyof T | 'nonFieldErrors']?: FieldErrors };

export type PendingRequest = {
  request: AxiosRequestConfig;
  resolve(value: any): void;
  reject(value: any): void;
};
