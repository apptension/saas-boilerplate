import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Store } from 'redux';

import { GlobalState } from '../../../app/config/reducers';
import { ENV } from '../../../app/config/env';
import { PendingRequest } from './types';
import { AUTH_URL, refreshToken } from './auth';

let pendingRequests: PendingRequest[] = [];

function delayRequest(request: AxiosRequestConfig) {
  return new Promise((resolve, reject) => {
    pendingRequests.push({
      request,
      resolve,
      reject,
    });
  });
}

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
      const isRequestQueueEmpty = pendingRequests.length === 0;
      const requestPromise = delayRequest(error.config);
      if (isRequestQueueEmpty) {
        await refreshToken();
        await Promise.all(
          pendingRequests.map(async ({ request, resolve, reject }: PendingRequest) => {
            try {
              resolve(axios.request({ ...request, baseURL: '/' }));
            } catch (e) {
              reject(e);
            }
          })
        );
        pendingRequests = [];
      }
      return requestPromise;
    } catch (ex) {
      pendingRequests = [];
      return forceLogout();
    }
  },
});

export type URLParams<T extends string> = Record<T, number | string>;

export type ExtractURLParams<T extends (constiables: any) => string> = Parameters<T>[0];

export const apiURL = (value: string) => ENV.BASE_API_URL + value;

function pathJoin(...args: Array<string>) {
  let parts: Array<string> = [];
  for (let i = 0, l = arguments.length; i < l; i++) {
    parts = parts.concat(args[i].split('/'));
  }
  const newParts = [];
  for (let i = 0, l = parts.length; i < l; i++) {
    const part = parts[i];
    if (!part || part === '.') continue;
    if (part === '..') newParts.pop();
    else newParts.push(part);
  }
  if (parts[0] === '') newParts.unshift('');
  return newParts.join('/') || (newParts.length ? '/' : '.');
}

export const apiURLs = <T extends Record<string, string | ((constiables: any) => string)>>(
  root: string,
  nestedRoutes: T
): T => {
  const joinURL = (value: string, baseUrl: string) => {
    const protocolRx = /https?:\/\//;
    if (protocolRx.test(baseUrl)) {
      return new URL(value, baseUrl).href;
    }
    return pathJoin(baseUrl, value);
  };

  const newEntries = Object.entries(nestedRoutes).map(([key, value]) => {
    const prefixedValue =
      typeof value === 'string'
        ? joinURL(pathJoin(root, value), ENV.BASE_API_URL) + '/'
        : (args: any) => joinURL(pathJoin(root, value(args)), ENV.BASE_API_URL) + '/';
    return [key, prefixedValue];
  });
  return Object.fromEntries(newEntries) as T;
};

export const appendId = ({ id }: URLParams<'id'>) => `/${id}`;
