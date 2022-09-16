import { combineReducers } from 'redux';
import { reducer as localesReducer } from '../../modules/locales/locales.reducer';
import { LocalesState } from '../../modules/locales/locales.types';
import { reducer as configReducer } from '../../modules/config/config.reducer';
import { ConfigState } from '../../modules/config/config.types';
import { reducer as snackbarReducer } from '../../modules/snackbar/snackbar.reducer';
import { SnackbarState } from '../../modules/snackbar/snackbar.types';
//<-- IMPORT MODULE REDUCER -->

export type GlobalState = {
  locales: LocalesState;
  config: ConfigState;
  snackbar: SnackbarState;
  //<-- INJECT MODULE STATE TYPE -->
};

export default function createReducer() {
  return combineReducers({
    locales: localesReducer,
    config: configReducer,
    snackbar: snackbarReducer,
    //<-- INJECT MODULE REDUCER -->
  });
}
