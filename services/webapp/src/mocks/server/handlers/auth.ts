import { DefaultBodyType, PathParams, rest } from 'msw';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../../shared/services/api/auth/types';
import { AUTH_PASSWORD_RESET_URL, AUTH_URL } from '../../../shared/services/api/auth';

export const mockSignup = (response: SignupApiResponseData = { isError: false }, status = 200) =>
  rest.post<SignupApiRequestData, PathParams, SignupApiResponseData>(AUTH_URL.SIGN_UP, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockRefreshToken = (status = 200) =>
  rest.post<DefaultBodyType, PathParams, DefaultBodyType>(AUTH_URL.REFRESH_TOKEN, (req, res, ctx) => {
    return res(ctx.status(status));
  });

export const mockLogout = (status = 200) =>
  rest.post<never, PathParams, any>(AUTH_URL.LOGOUT, (req, res, ctx) => {
    return res(ctx.status(status));
  });

export const mockChangePassword = (response: ChangePasswordResponseData = { isError: false }, status = 200) =>
  rest.post<ChangePasswordRequestData, PathParams, ChangePasswordResponseData>(
    AUTH_URL.CHANGE_PASSWORD,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockConfirmEmail = (
  response: ConfirmEmailResponseData = { isError: false },
  status = 200,
  delayPromise: Promise<void> | null = null
) =>
  rest.post<ConfirmEmailRequestData, PathParams, ConfirmEmailResponseData>(
    AUTH_URL.CONFIRM_EMAIL,
    async (req, res, ctx) => {
      if (delayPromise) {
        await delayPromise;
      }
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockRequestPasswordReset = (
  response: RequestPasswordResetResponseData = { isError: false },
  status = 200
) =>
  rest.post<RequestPasswordResetRequestData, PathParams, RequestPasswordResetResponseData>(
    AUTH_PASSWORD_RESET_URL.REQUEST,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockConfirmPasswordReset = (
  response: ConfirmPasswordResetResponseData = { isError: false },
  status = 200,
  promise?: Promise<void>
) =>
  rest.post<ConfirmPasswordResetRequestData, PathParams, ConfirmPasswordResetResponseData>(
    AUTH_PASSWORD_RESET_URL.CONFIRM,
    async (req, res, ctx) => {
      if (promise) {
        await promise;
      }
      return res(ctx.status(status), ctx.json(response));
    }
  );
