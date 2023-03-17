import { ENV } from '@sb/webapp-core/config/env';
import axios, { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';

import { AUTH_URL } from '../auth';
import { client } from '../client';
import { apiURLs, validateStatus } from '../helpers';
import { createRefreshTokenInterceptor } from '../interceptors';

describe('api', () => {
  describe('validate status', () => {
    it('should return true for 200 statuses', () => {
      expect(validateStatus(200)).toBe(true);
      expect(validateStatus(201)).toBe(true);
      expect(validateStatus(202)).toBe(true);
    });

    it('should return true for 400 status', () => {
      expect(validateStatus(400)).toBe(true);
    });

    it('should return false for other statuses', () => {
      expect(validateStatus(100)).toBe(false);
      expect(validateStatus(300)).toBe(false);
      expect(validateStatus(301)).toBe(false);
      expect(validateStatus(401)).toBe(false);
      expect(validateStatus(402)).toBe(false);
      expect(validateStatus(404)).toBe(false);
      expect(validateStatus(500)).toBe(false);
    });
  });

  describe('createRefreshTokenInterceptor', () => {
    const interceptor = createRefreshTokenInterceptor();

    describe('onFulfilled', () => {
      it('should return response', () => {
        const response = { status: 200, data: { foo: 'bar' } } as AxiosResponse;
        expect(interceptor.onFulfilled(response)).toEqual(response);
      });
    });

    describe('onRejected', () => {
      describe('is rejected with status other than UNAUTHORIZED (401)', () => {
        it('should reject with same error', async () => {
          const error = { foo: 'bar', response: { status: StatusCodes.INTERNAL_SERVER_ERROR } };
          await expect(interceptor.onRejected(error as any)).rejects.toBe(error);
        });
      });

      describe('is rejected with UNAUTHORIZED (401) status', () => {
        let apiPostSpy: jest.SpyInstance, axiosRequestSpy: jest.SpyInstance;

        beforeEach(() => {
          apiPostSpy = jest.spyOn(client, 'post');
          axiosRequestSpy = jest.spyOn(axios, 'request');
        });

        afterEach(() => {
          apiPostSpy.mockRestore();
          axiosRequestSpy.mockRestore();
        });

        it('should call refresh token endpoint', async () => {
          const error = { foo: 'bar', response: { status: StatusCodes.UNAUTHORIZED }, config: { url: AUTH_URL.ME } };
          axiosRequestSpy.mockResolvedValue({ status: StatusCodes.OK, data: { foo: 'result' } } as AxiosResponse);
          await interceptor.onRejected(error as any);
          expect(apiPostSpy).toHaveBeenCalledWith(AUTH_URL.REFRESH_TOKEN);
        });

        describe('token refresh is successful', () => {
          it('should retry same request and return response', async () => {
            const requestResponse = { status: StatusCodes.OK, data: { foo: 'result' } } as AxiosResponse;
            const error = { foo: 'bar', response: { status: StatusCodes.UNAUTHORIZED }, config: { url: AUTH_URL.ME } };
            axiosRequestSpy.mockResolvedValue(requestResponse);

            const res = await interceptor.onRejected(error as any);
            expect(axiosRequestSpy).toHaveBeenCalledWith({
              ...error.config,
              baseURL: '/',
            });
            expect(res).toEqual(requestResponse);
          });
        });
      });
    });
  });

  describe('apiURLs', () => {
    const originalEnv = ENV.BASE_API_URL;

    beforeAll(() => {
      ENV.BASE_API_URL = 'https://api.example.com';
    });

    afterAll(() => {
      ENV.BASE_API_URL = originalEnv;
    });

    it('should return an object with joined URLs based on root and nestedRoutes arguments', () => {
      const nestedRoutes = {
        getUsers: '/users',
        getUserById: ({ id }: { id: string }) => `/users/${id}`,
      };

      const urls = apiURLs('api', nestedRoutes);
      expect(urls).toEqual({
        getUsers: `https://api.example.com/api/users/`,
        getUserById: expect.any(Function),
      });
    });

    it('returns object with urls with parameters', () => {
      const urls = apiURLs('/root', {
        get: ({ id }) => `/item/${id}`,
        post: '/item',
        put: ({ id }) => `/item/${id}`,
        delete: ({ id }) => `/item/${id}`,
      });

      expect(urls.get({ id: 1 })).toEqual('https://api.example.com/root/item/1/');
      expect(urls.post).toEqual('https://api.example.com/root/item/');
      expect(urls.put({ id: 1 })).toEqual('https://api.example.com/root/item/1/');
      expect(urls.delete({ id: 1 })).toEqual('https://api.example.com/root/item/1/');
    });
  });
});
