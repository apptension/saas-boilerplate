import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { Store } from 'redux';
import { GlobalState } from '../../../app/config/reducers';
import { createRefreshTokenInterceptor, validateStatus } from './helpers';

export const client = applyCaseMiddleware(
  axios.create({
    withCredentials: true,
    validateStatus,
  })
);

export const setupStoreInterceptors = (store: Store<GlobalState>) => {
  const refreshTokenInterceptor = createRefreshTokenInterceptor(store);
  client.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
};
