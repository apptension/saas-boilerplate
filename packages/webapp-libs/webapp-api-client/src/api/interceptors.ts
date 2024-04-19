import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';

import { Emitter } from '../utils/eventEmitter';
import { AUTH_URL, refreshToken } from './auth';
import { ApiClientEvents, PendingRequest } from './types';

let pendingRequests: PendingRequest[] = [];

function delayRequest(request?: AxiosRequestConfig) {
  return new Promise((resolve, reject) => {
    pendingRequests.push({
      request,
      resolve,
      reject,
    });
  });
}

type CreateRefreshTokenInterceptorProps = { emitter?: Emitter };
export const createRefreshTokenInterceptor = (props?: CreateRefreshTokenInterceptorProps) => ({
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: AxiosError) => {
    const forceLogout = () => {
      props?.emitter?.dispatchEvent(ApiClientEvents.FORCE_LOGOUT_REQUESTED, {});
      return Promise.reject(error);
    };

    if (error.response?.status !== StatusCodes.UNAUTHORIZED) {
      return Promise.reject(error);
    }

    if (error.config?.url === AUTH_URL.REFRESH_TOKEN) {
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
