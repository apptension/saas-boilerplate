import { DefaultBodyType, PathParams, rest } from 'msw';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  MeApiResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
  UpdateAvatarApiRequestData,
  UpdateAvatarApiResponseData,
  UpdateProfileApiRequestData,
  UpdateProfileApiResponseData,
} from '../../../shared/services/api/auth/types';
import { AUTH_PASSWORD_RESET_URL, AUTH_URL } from '../../../shared/services/api/auth';
import { Role } from '../../../modules/auth/auth.types';
import { userProfileFactory } from '../../factories';

const profile = userProfileFactory({
  email: 'user@mail.com',
  firstName: 'User',
  lastName: 'White',
  roles: [Role.ADMIN],
});

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

export const mockMe = (response: MeApiResponseData = profile, status = 200) =>
  rest.get<never, PathParams, MeApiResponseData>(AUTH_URL.ME, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockUpdateProfile = (
  response: UpdateProfileApiResponseData = { ...profile, isError: false },
  status = 200
) =>
  rest.put<UpdateProfileApiRequestData, PathParams, UpdateProfileApiResponseData>(
    AUTH_URL.UPDATE_PROFILE,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockUpdateAvatar = (
  response: UpdateAvatarApiResponseData = { ...profile, isError: false },
  status = 200
) =>
  rest.put<UpdateAvatarApiRequestData, PathParams, UpdateAvatarApiResponseData>(
    AUTH_URL.UPDATE_AVATAR,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

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
