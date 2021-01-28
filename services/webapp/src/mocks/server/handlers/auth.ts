import { rest } from 'msw';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  LoginApiRequestData,
  LoginApiResponseData,
  MeApiResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../../shared/services/api/auth/types';
import {
  AUTH_CHANGE_PASSWORD_URL,
  AUTH_LOGIN_URL,
  AUTH_ME_URL,
  AUTH_SIGNUP_URL,
} from '../../../shared/services/api/auth';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

const MOCK_SIGNUP_RESPONSE = { isError: false as const, email: 'test@gm.com', id: '123', profile: {} };

export const mockSignup = (response: SignupApiResponseData = MOCK_SIGNUP_RESPONSE, status = 200) =>
  rest.post<SignupApiRequestData, SignupApiResponseData>(baseUrl + AUTH_SIGNUP_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockLogin = (status = 200, response: LoginApiResponseData = { isError: false }) =>
  rest.post<LoginApiRequestData, LoginApiResponseData>(baseUrl + AUTH_LOGIN_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockMe = (response: MeApiResponseData = {}, status = 200) =>
  rest.get<SignupApiRequestData, MeApiResponseData>(baseUrl + AUTH_ME_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockChangePassword = (response: ChangePasswordResponseData = { isError: false }, status = 200) =>
  rest.post<ChangePasswordRequestData, ChangePasswordResponseData>(
    baseUrl + AUTH_CHANGE_PASSWORD_URL,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );
