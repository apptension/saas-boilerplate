import { ApiFormSubmitResponse } from '../types';

export type RequestPasswordResetRequestData = { email: string };
export type RequestPasswordResetResponseData = ApiFormSubmitResponse<RequestPasswordResetRequestData, void>;

export type ConfirmPasswordResetRequestData = { user: string; token: string; newPassword: string };
export type ConfirmPasswordResetResponseData = ApiFormSubmitResponse<RequestPasswordResetRequestData, void>;

export type LogoutApiResponseData = void;
