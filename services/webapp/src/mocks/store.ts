import { produce } from 'immer';
import { GlobalState } from '../app/config/reducers';
import { STARTUP_INITIAL_STATE } from '../modules/startup';
import { AUTH_INITIAL_STATE } from '../modules/auth';
import { CONFIG_INITIAL_STATE } from '../modules/config';
import { STRIPE_INITIAL_STATE } from '../modules/stripe';
import { SNACKBAR_INITIAL_STATE } from '../modules/snackbar';
import { SUBSCRIPTION_INITIAL_STATE } from '../modules/subscription';
import { DEFAULT_LOCALE } from '../app/config/i18n';
//<-- IMPORT MODULE STATE -->

export const store: GlobalState = {
  locales: {
    language: DEFAULT_LOCALE,
  },
  startup: STARTUP_INITIAL_STATE,
  auth: AUTH_INITIAL_STATE,
  config: CONFIG_INITIAL_STATE,
  snackbar: SNACKBAR_INITIAL_STATE,
  stripe: STRIPE_INITIAL_STATE,
  subscription: SUBSCRIPTION_INITIAL_STATE,
  //<-- INJECT MODULE STATE -->
};

export const prepareState = (stateSetter: (draftState: GlobalState) => void) => produce(store, stateSetter);
