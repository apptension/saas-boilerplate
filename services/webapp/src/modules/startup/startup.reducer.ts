import { createReducer } from '@reduxjs/toolkit';
import { StartupState } from './startup.types';
import * as startupActions from './startup.actions';

export const INITIAL_STATE: StartupState = {
  profileStartupCompleted: false,
};

const handleProfileStartupReset = (state: StartupState) => {
  state.profileStartupCompleted = false;
};

const handleProfileStartupCompleted = (state: StartupState) => {
  state.profileStartupCompleted = true;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(startupActions.completeProfileStartup, handleProfileStartupCompleted);
  builder.addCase(startupActions.startup, handleProfileStartupReset);
});
