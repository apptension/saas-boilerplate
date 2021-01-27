import { combineReducers } from 'redux';

import { reducer as localesReducer } from '../modules/locales/locales.reducer';
import { LocalesState } from '../modules/locales/locales.types';
import { reducer as startupReducer } from '../modules/startup/startup.reducer';
import { StartupState } from '../modules/startup/startup.types';
import { reducer as authReducer } from '../modules/auth/auth.reducer';
import { AuthState } from '../modules/auth/auth.types';
//<-- IMPORT MODULE REDUCER -->

export type GlobalState = {
  locales: LocalesState;
  startup: StartupState;
  auth: AuthState;
  //<-- INJECT MODULE STATE TYPE -->
};

export default function createReducer() {
  return combineReducers({
    locales: localesReducer,
    startup: startupReducer,
    auth: authReducer,
    //<-- INJECT MODULE REDUCER -->
  });
}
