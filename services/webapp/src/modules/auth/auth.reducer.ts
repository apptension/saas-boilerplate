import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { SignupApiResponseData } from '../../shared/services/api/auth/types';
import * as authActions from './auth.actions';
import { AuthState, SignupSuccessPayload } from './auth.types';

export const INITIAL_STATE: AuthState = {
  profile: undefined,
};

const handleSignupSuccess = (state: AuthState, { payload }: PayloadAction<SignupApiResponseData>) => {
  if (!payload.isError) {
    state.profile = payload.profile;
  }
};

const handleFetchProfileSuccess = (state: AuthState, { payload }: PayloadAction<SignupSuccessPayload>) => {
  state.profile = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(authActions.signup.resolved, handleSignupSuccess);
  builder.addCase(authActions.fetchProfileSuccess, handleFetchProfileSuccess);
});
