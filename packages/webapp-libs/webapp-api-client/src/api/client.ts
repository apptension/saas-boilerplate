import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

import { Emitter } from '../utils/eventEmitter';
import { validateStatus } from './helpers';
import { createRefreshTokenInterceptor } from './interceptors';

export const emitter = new Emitter();

export const client = applyCaseMiddleware(
  axios.create({
    withCredentials: true,
    validateStatus,
  })
);

export const setupStoreInterceptors = () => {
  const refreshTokenInterceptor = createRefreshTokenInterceptor({ emitter });
  client.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
};
