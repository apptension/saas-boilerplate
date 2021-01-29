import { rest } from 'msw';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  LoginApiRequestData,
  LoginApiResponseData,
  MeApiRequestData,
  MeApiResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../../shared/services/api/auth/types';
import {
  AUTH_CHANGE_PASSWORD_URL,
  AUTH_CONFIRM_EMAIL_URL,
  AUTH_LOGIN_URL,
  AUTH_ME_URL,
  AUTH_SIGNUP_URL,
} from '../../../shared/services/api/auth';
import { Profile, Role } from '../../../modules/auth/auth.types';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

const profile: Profile = { email: 'user@mail.com', firstName: 'User', lastName: 'White', roles: [Role.ADMIN] };

export const mockSignup = (response: SignupApiResponseData = { isError: false, profile }, status = 200) =>
  rest.post<SignupApiRequestData, SignupApiResponseData>(baseUrl + AUTH_SIGNUP_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockLogin = (status = 200, response: LoginApiResponseData = { isError: false }) =>
  rest.post<LoginApiRequestData, LoginApiResponseData>(baseUrl + AUTH_LOGIN_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockMe = (response: MeApiResponseData = profile, status = 200) =>
  rest.get<MeApiRequestData, MeApiResponseData>(baseUrl + AUTH_ME_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockChangePassword = (response: ChangePasswordResponseData = { isError: false }, status = 200) =>
  rest.post<ChangePasswordRequestData, ChangePasswordResponseData>(
    baseUrl + AUTH_CHANGE_PASSWORD_URL,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockConfirmEmail = (response: ConfirmEmailResponseData = { isError: false }, status = 200) =>
  rest.post<ConfirmEmailRequestData, ConfirmEmailResponseData>(baseUrl + AUTH_CONFIRM_EMAIL_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });
