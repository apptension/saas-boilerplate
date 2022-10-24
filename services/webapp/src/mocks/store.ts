import { produce } from 'immer';
import { GlobalState } from '../app/config/reducers';
import { SNACKBAR_INITIAL_STATE } from '../modules/snackbar';
import { DEFAULT_LOCALE } from '../app/config/i18n';
//<-- IMPORT MODULE STATE -->

export const store: GlobalState = {
  locales: {
    language: DEFAULT_LOCALE,
  },
  snackbar: SNACKBAR_INITIAL_STATE,
  //<-- INJECT MODULE STATE -->
};

export const prepareState = (stateSetter: (draftState: GlobalState) => void) => produce(store, stateSetter);
