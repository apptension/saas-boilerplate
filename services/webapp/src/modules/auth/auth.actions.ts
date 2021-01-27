import { actionCreator } from '../helpers';
import {
  LoginApiRequestData,
  LoginApiResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../shared/services/api/auth/types';
import { FetchProfileSuccessPayload } from './auth.types';

const { createPromiseAction, createAction } = actionCreator('AUTH');

export const signup = createPromiseAction<SignupApiRequestData, SignupApiResponseData>('SIGNUP');

export const login = createPromiseAction<LoginApiRequestData, LoginApiResponseData>('LOGIN');

export const fetchProfile = createAction<void>('FETCH_PROFILE');
export const fetchProfileSuccess = createAction<FetchProfileSuccessPayload>('FETCH_PROFILE_SUCCESS');
