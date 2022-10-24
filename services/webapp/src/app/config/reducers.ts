import { combineReducers } from 'redux';
import { reducer as localesReducer } from '../../modules/locales/locales.reducer';
import { LocalesState } from '../../modules/locales/locales.types';
import { reducer as snackbarReducer } from '../../modules/snackbar/snackbar.reducer';
import { SnackbarState } from '../../modules/snackbar/snackbar.types';
//<-- IMPORT MODULE REDUCER -->

export type GlobalState = {
  locales: LocalesState;
  snackbar: SnackbarState;
  //<-- INJECT MODULE STATE TYPE -->
};

export default function createReducer() {
  return combineReducers({
    locales: localesReducer,
    snackbar: snackbarReducer,
    //<-- INJECT MODULE REDUCER -->
  });
}
