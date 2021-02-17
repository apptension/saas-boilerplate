import { combineReducers } from 'redux';

import { reducer as localesReducer } from '../modules/locales/locales.reducer';
import { LocalesState } from '../modules/locales/locales.types';
import { reducer as startupReducer } from '../modules/startup/startup.reducer';
import { StartupState } from '../modules/startup/startup.types';
import { reducer as authReducer } from '../modules/auth/auth.reducer';
import { AuthState } from '../modules/auth/auth.types';
import { reducer as configReducer } from '../modules/config/config.reducer';
import { ConfigState } from '../modules/config/config.types';
import { reducer as demoItemsReducer } from '../modules/demoItems/demoItems.reducer';
import { DemoItemsState } from '../modules/demoItems/demoItems.types';
//<-- IMPORT MODULE REDUCER -->

export type GlobalState = {
  locales: LocalesState;
  startup: StartupState;
  auth: AuthState;
  config: ConfigState;
  demoItems: DemoItemsState;
  //<-- INJECT MODULE STATE TYPE -->
};

export default function createReducer() {
  return combineReducers({
    locales: localesReducer,
    startup: startupReducer,
    auth: authReducer,
    config: configReducer,
    demoItems: demoItemsReducer,
    //<-- INJECT MODULE REDUCER -->
  });
}
