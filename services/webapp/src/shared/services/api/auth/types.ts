import { ApiFormSubmitResponse } from '../types';
import { Role } from '../../../../modules/auth/auth.types';

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email: string;
  roles: Role[];
}

interface ProfileApiResponseData {
  profile: ProfileData;
}

interface ApiCredentialsData {
  email: string;
  password: string;
}

export type LoginApiRequestData = ApiCredentialsData;
export type LoginApiResponseData = ApiFormSubmitResponse<LoginApiRequestData, void>;

export type SignupApiRequestData = ApiCredentialsData;
export type SignupApiResponseData = ApiFormSubmitResponse<SignupApiRequestData, ProfileApiResponseData>;

export type MeApiRequestData = void;
export type MeApiResponseData = ProfileData;

export type ChangePasswordRequestData = {
  oldPassword: string;
  newPassword: string;
};
export type ChangePasswordResponseData = ApiFormSubmitResponse<ChangePasswordRequestData, void>;
