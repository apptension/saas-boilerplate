import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'ramda';
import { UpdateAvatarApiResponseData, UpdateProfileApiResponseData } from '../../shared/services/api/auth/types';
import * as authActions from './auth.actions';
import { AuthState, FetchProfileSuccessPayload } from './auth.types';

export const INITIAL_STATE: AuthState = {
  isLoggedIn: false,
  profile: undefined,
};

const handleFetchProfileSuccess = (state: AuthState, { payload }: PayloadAction<FetchProfileSuccessPayload>) => {
  state.profile = payload;
  state.isLoggedIn = true;
};

const handleResetProfile = (state: AuthState) => {
  state.profile = undefined;
  state.isLoggedIn = false;
};

const handleUpdateProfileResolved = (state: AuthState, { payload }: PayloadAction<UpdateProfileApiResponseData>) => {
  if (!payload.isError) {
    state.profile = omit(['isError'], payload);
  }
};

const handleUpdateAvatarResolved = (state: AuthState, { payload }: PayloadAction<UpdateAvatarApiResponseData>) => {
  if (!payload.isError) {
    state.profile = omit(['isError'], payload);
  }
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(authActions.fetchProfile.resolved, handleFetchProfileSuccess);
  builder.addCase(authActions.resetProfile, handleResetProfile);
  builder.addCase(authActions.updateProfile.resolved, handleUpdateProfileResolved);
  builder.addCase(authActions.updateAvatar.resolved, handleUpdateAvatarResolved);
});
