import { AxiosRequestConfig } from 'axios';

export * from './auth/auth.types';

export type FieldError = {
  message?: string;
  code: string;
};

export type FieldErrors = FieldError[];

export type FormSubmitError<T = unknown> = { [key in keyof T | 'nonFieldErrors']?: FieldErrors };

export type PendingRequest = {
  request?: AxiosRequestConfig;
  resolve(value: any): void;
  reject(value: any): void;
};

export enum ApiClientEvents {
  FORCE_LOGOUT_REQUESTED = 'FORCE_LOGOUT_REQUESTED',
}
