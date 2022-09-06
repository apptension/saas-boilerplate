import { ApiFormSubmitResponse } from '../types';

interface ApiCredentialsData {
  email: string;
  password: string;
}

export type SignupApiRequestData = ApiCredentialsData;
export type SignupApiResponseData = ApiFormSubmitResponse<SignupApiRequestData, void>;

export type ChangePasswordRequestData = { oldPassword: string; newPassword: string };
export type ChangePasswordResponseData = ApiFormSubmitResponse<ChangePasswordRequestData, void>;

export type ConfirmEmailRequestData = { token: string; user: string };
export type ConfirmEmailResponseData = ApiFormSubmitResponse<ConfirmEmailRequestData, void>;

export type RequestPasswordResetRequestData = { email: string };
export type RequestPasswordResetResponseData = ApiFormSubmitResponse<RequestPasswordResetRequestData, void>;

export type ConfirmPasswordResetRequestData = { user: string; token: string; newPassword: string };
export type ConfirmPasswordResetResponseData = ApiFormSubmitResponse<RequestPasswordResetRequestData, void>;

export type LogoutApiRequestData = void;
export type LogoutApiResponseData = void;
