import { ProfileData } from '../../shared/services/api/auth/types';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum OAuthProvider {
  Google = 'google-oauth2',
  Facebook = 'facebook',
}

export type Profile = ProfileData;

export type SignupSuccessPayload = Profile;

export type FetchProfileSuccessPayload = Profile;

export interface AuthState {
  profile?: Profile;
  isLoggedIn: boolean;
}
