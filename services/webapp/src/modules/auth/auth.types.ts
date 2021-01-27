import { ProfileData } from '../../shared/services/api/auth/types';

export type Profile = ProfileData;

export type SignupSuccessPayload = Profile;

export type FetchProfileSuccessPayload = Profile;

export interface AuthState {
  profile?: Profile;
}
