import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { Store } from 'redux';
import { GlobalState } from '../../../config/reducers';
import { createRefreshTokenInterceptor, validateStatus } from './helpers';

export const baseUrl = process.env.REACT_APP_BASE_API_URL || '/api';

if (!baseUrl) {
  throw new Error('REACT_APP_BASE_API_URL env is missing');
}

export const client = applyCaseMiddleware(
  axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    validateStatus,
  })
);

export const graphQlClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  validateStatus,
});

export const setupStoreInterceptors = (store: Store<GlobalState>) => {
  const refreshTokenInterceptor = createRefreshTokenInterceptor(store);
  client.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
  graphQlClient.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
};
