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

/**
 * Request interceptor that adds Authorization header from localStorage.
 * 
 * This is essential for Safari and mobile browsers that block third-party cookies
 * due to Intelligent Tracking Prevention (ITP). When cookies are blocked,
 * we fall back to sending the access token via Authorization header.
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupStoreInterceptors = () => {
  const refreshTokenInterceptor = createRefreshTokenInterceptor({ emitter });
  client.interceptors.response.use(refreshTokenInterceptor.onFulfilled, refreshTokenInterceptor.onRejected);
};
