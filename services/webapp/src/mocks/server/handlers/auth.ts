import { rest } from 'msw';
import {
  LoginApiResponseData,
  MeApiResponseData,
  SignupApiResponseData,
} from '../../../shared/services/api/auth/types';
import { AUTH_LOGIN_URL, AUTH_ME_URL, AUTH_SIGNUP_URL } from '../../../shared/services/api/auth';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

const MOCK_SIGNUP_RESPONSE = { isError: false as const, email: 'test@gm.com', id: '123', profile: {} };

export const mockSignup = (response: SignupApiResponseData = MOCK_SIGNUP_RESPONSE, status = 200) =>
  rest.post<void, SignupApiResponseData>(baseUrl + AUTH_SIGNUP_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockLogin = (status = 200, response: LoginApiResponseData = { isError: false }) =>
  rest.post<void, LoginApiResponseData>(baseUrl + AUTH_LOGIN_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockMe = (response: MeApiResponseData = {}, status = 200) =>
  rest.get<void, MeApiResponseData>(baseUrl + AUTH_ME_URL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });
