import { actionCreator } from '../helpers';
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
} from '../../shared/services/api/auth/types';

const { createPromiseAction } = actionCreator('AUTH');

export const signup = createPromiseAction<SignupApiRequestData, SignupApiResponseData>('SIGNUP');
export const login = createPromiseAction<LoginApiRequestData, LoginApiResponseData>('LOGIN');
export const changePassword = createPromiseAction<ChangePasswordRequestData, ChangePasswordResponseData>(
  'CHANGE_PASSWORD'
);
export const fetchProfile = createPromiseAction<MeApiRequestData, MeApiResponseData>('FETCH_PROFILE');
export const confirmEmail = createPromiseAction<ConfirmEmailRequestData, ConfirmEmailResponseData>('CONFIRM_EMAIL');
