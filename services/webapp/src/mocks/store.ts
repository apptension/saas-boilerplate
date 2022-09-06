import { produce } from 'immer';
import { GlobalState } from '../app/config/reducers';
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
  config: CONFIG_INITIAL_STATE,
  snackbar: SNACKBAR_INITIAL_STATE,
  stripe: STRIPE_INITIAL_STATE,
  subscription: SUBSCRIPTION_INITIAL_STATE,
  //<-- INJECT MODULE STATE -->
};

export const prepareState = (stateSetter: (draftState: GlobalState) => void) => produce(store, stateSetter);
