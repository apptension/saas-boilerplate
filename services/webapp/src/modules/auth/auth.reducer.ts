import { createReducer, PayloadAction } from '@reduxjs/toolkit';

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

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(authActions.fetchProfileSuccess, handleFetchProfileSuccess);
});
