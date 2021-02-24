import axios, { AxiosResponse } from 'axios';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';
import { Store } from 'redux';
import { GlobalState } from '../../../config/reducers';
import { baseUrl } from './client';
import { AUTH_TOKEN_REFRESH_URL, refreshToken } from './auth';

export const validateStatus = (status: number) => (status >= 200 && status < 300) || status === BAD_REQUEST;

export const createRefreshTokenInterceptor = (store: Store<GlobalState>) => ({
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: any) => {
    const forceLogout = () => {
      store.dispatch({ type: 'AUTH/LOGOUT.RESOLVED' });
      return Promise.reject(error);
    };

    if (error.response.status !== UNAUTHORIZED) {
      return Promise.reject(error);
    }

    if (error.config.url === baseUrl + AUTH_TOKEN_REFRESH_URL) {
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
