import path from 'path';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Store } from 'redux';
import { GlobalState } from '../../../app/config/reducers';
import { ENV } from '../../../app/config/env';
import { AUTH_URL, refreshToken } from './auth';

export const validateStatus = (status: number) => (status >= 200 && status < 300) || status === StatusCodes.BAD_REQUEST;

export const createRefreshTokenInterceptor = (store: Store<GlobalState>) => ({
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: AxiosError) => {
    const forceLogout = () => {
      store.dispatch({ type: 'AUTH/LOGOUT.RESOLVED' });
      return Promise.reject(error);
    };

    if (error.response?.status !== StatusCodes.UNAUTHORIZED) {
      return Promise.reject(error);
    }

    if (error.config.url === AUTH_URL.REFRESH_TOKEN) {
      return forceLogout();
    }

    try {
      await refreshToken();
      return axios.request({
        ...error.config,
        baseURL: '/',
      });
    } catch (ex) {
      return forceLogout();
    }
  },
});

export type URLParams<T extends string> = Record<T, number | string>;

export type ExtractURLParams<T extends (variables: any) => string> = Parameters<T>[0];

export const apiURL = (value: string) => ENV.BASE_API_URL + value;

export const apiURLs = <T extends Record<string, string | ((variables: any) => string)>>(
  root: string,
  nestedRoutes: T
): T => {
  const rootWithBase = apiURL(root);
  const newEntries = Object.entries(nestedRoutes).map(([key, value]) => {
    const prefixedValue =
      typeof value === 'string' ? path.join(rootWithBase, value) : (args: any) => path.join(rootWithBase, value(args));
    return [key, prefixedValue];
  });
  return Object.fromEntries(newEntries) as T;
};

export const appendId = ({ id }: URLParams<'id'>) => `/${id}`;
