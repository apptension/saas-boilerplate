import { DEFAULT_LOCALE } from '@saas-boilerplate-app/webapp-core/config/i18n';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { generatePath, redirect } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AUTH_URL, refreshToken } from './auth';
import { PendingRequest } from './types';

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

export const createRefreshTokenInterceptor = () => ({
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: AxiosError) => {
    const forceLogout = () => {
      const lang = localStorage.getItem('LOCALES_LANGUAGE') ?? DEFAULT_LOCALE;

      redirect(generatePath(RoutesConfig.getLocalePath([RoutesConfig.logout]), { lang }));
      return Promise.reject(error);
    };

    if (error.response?.status !== StatusCodes.UNAUTHORIZED) {
      return Promise.reject(error);
    }

    if (error.config.url === AUTH_URL.REFRESH_TOKEN) {
      return Promise.reject(error);
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
