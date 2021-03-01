import { produce } from 'immer';

import { GlobalState } from '../config/reducers';
import { LOCALES_INITIAL_STATE } from '../modules/locales';
import { STARTUP_INITIAL_STATE } from '../modules/startup';
import { AUTH_INITIAL_STATE } from '../modules/auth';
import { CONFIG_INITIAL_STATE } from '../modules/config';
import { DEMO_ITEMS_INITIAL_STATE } from '../modules/demoItems';
import { CRUD_DEMO_ITEM_INITIAL_STATE } from '../modules/crudDemoItem';
import { SNACKBAR_INITIAL_STATE } from '../modules/snackbar';
//<-- IMPORT MODULE STATE -->

export const store: GlobalState = {
  locales: LOCALES_INITIAL_STATE,
  startup: STARTUP_INITIAL_STATE,
  auth: AUTH_INITIAL_STATE,
  config: CONFIG_INITIAL_STATE,
  demoItems: DEMO_ITEMS_INITIAL_STATE,
  crudDemoItem: CRUD_DEMO_ITEM_INITIAL_STATE,
  snackbar: SNACKBAR_INITIAL_STATE,
  //<-- INJECT MODULE STATE -->
};

export const prepareState = (stateSetter: (draftState: GlobalState) => void) => produce(store, stateSetter);
