import { actionCreator } from '../helpers/actionCreator';
import {
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
} from '../../shared/services/api/auth/types';
import { OAuthProvider } from './auth.types';

const { createPromiseAction } = actionCreator('AUTH');

export const oAuthLogin = createPromiseAction<OAuthProvider, void>('OAUTH_LOGIN');
export const confirmEmail = createPromiseAction<ConfirmEmailRequestData, ConfirmEmailResponseData>('CONFIRM_EMAIL');
export const requestPasswordReset = createPromiseAction<
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData
>('REQUEST_PASSWORD_RESET');
export const confirmPasswordReset = createPromiseAction<
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData
>('CONFIRM_PASSWORD_RESET');
