import { produce } from 'immer';

import { GlobalState } from '../config/reducers';
import { LOCALES_INITIAL_STATE } from '../modules/locales';
import { STARTUP_INITIAL_STATE } from '../modules/startup';
import { AUTH_INITIAL_STATE } from '../modules/auth';
//<-- IMPORT MODULE STATE -->

export const store: GlobalState = {
  locales: LOCALES_INITIAL_STATE,
  startup: STARTUP_INITIAL_STATE,
  auth: AUTH_INITIAL_STATE,
  //<-- INJECT MODULE STATE -->
};

export const prepareState = (stateSetter: (draftState: GlobalState) => void) => produce(store, stateSetter);
