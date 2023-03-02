import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

import { validateStatus } from './helpers';
import { createRefreshTokenInterceptor } from './interceptors';

export const client = applyCaseMiddleware(
  axios.create({
    withCredentials: true,
    validateStatus,
  })
);

export const setupStoreInterceptors = () => {
  const refreshTokenInterceptor = createRefreshTokenInterceptor();
  client.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
};
