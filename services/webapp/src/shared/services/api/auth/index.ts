import { client } from '../client';
import {
  SignupApiRequestData,
  LoginApiRequestData,
  LoginApiResponseData,
  SignupApiResponseData,
  MeApiResponseData,
} from './types';

export const AUTH_URL = '/auth';
export const AUTH_SIGNUP_URL = AUTH_URL + `/signup/`;
export const AUTH_LOGIN_URL = AUTH_URL + `/token/`;
export const AUTH_ME_URL = AUTH_URL + `/me/`;

export const signup = async (creds: SignupApiRequestData) => {
  const res = await client.post<SignupApiResponseData>(AUTH_SIGNUP_URL, creds);
  return res.data;
};

export const login = async (creds: LoginApiRequestData) => {
  const res = await client.post<LoginApiResponseData>(AUTH_LOGIN_URL, creds);
  return res.data;
};

export const me = async () => {
  const res = await client.get<MeApiResponseData>(AUTH_ME_URL);
  return res.data;
};
