import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { LogoutApiResponseData, UpdateProfileApiResponseData } from '../../shared/services/api/auth/types';
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

const handleLogoutResolved = (state: AuthState, { payload }: PayloadAction<LogoutApiResponseData>) => {
  if (!payload.isError) {
    state.profile = undefined;
    state.isLoggedIn = false;
  }
};

const handleUpdateProfileResolved = (state: AuthState, { payload }: PayloadAction<UpdateProfileApiResponseData>) => {
  if (!payload.isError) {
    state.profile = payload;
  }
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(authActions.fetchProfile.resolved, handleFetchProfileSuccess);
  builder.addCase(authActions.logout.resolved, handleLogoutResolved);
  builder.addCase(authActions.updateProfile.resolved, handleUpdateProfileResolved);
});
