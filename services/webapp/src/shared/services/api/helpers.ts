import axios, { AxiosResponse, AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Store } from 'redux';
import { GlobalState } from '../../../config/reducers';
import { AUTH_TOKEN_REFRESH_URL, refreshToken } from './auth';

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

    if (error.config.url === AUTH_TOKEN_REFRESH_URL) {
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
