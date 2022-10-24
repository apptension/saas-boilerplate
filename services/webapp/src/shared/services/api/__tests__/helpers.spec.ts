import { createStore } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import createReducer from '../../../../app/config/reducers';
import { store as fixturesStore } from '../../../../mocks/store';
import { client } from '../client';
import { AUTH_URL } from '../auth';
import { validateStatus } from '../helpers';
import { createRefreshTokenInterceptor } from '../interceptors';

describe('shared / services / api', () => {
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
    const store = createStore(createReducer(), fixturesStore);
    const interceptor = createRefreshTokenInterceptor(store);
    const mockDispatch = jest.spyOn(store, 'dispatch');

    afterEach(() => {
      mockDispatch.mockReset();
    });

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
});
