import { combineReducers } from 'redux';
import { reducer as localesReducer } from '../../modules/locales/locales.reducer';
import { LocalesState } from '../../modules/locales/locales.types';
import { reducer as startupReducer } from '../../modules/startup/startup.reducer';
import { StartupState } from '../../modules/startup/startup.types';
import { reducer as authReducer } from '../../modules/auth/auth.reducer';
import { AuthState } from '../../modules/auth/auth.types';
import { reducer as configReducer } from '../../modules/config/config.reducer';
import { ConfigState } from '../../modules/config/config.types';
import { reducer as stripeReducer } from '../../modules/stripe/stripe.reducer';
import { StripeState } from '../../modules/stripe/stripe.types';
import { reducer as snackbarReducer } from '../../modules/snackbar/snackbar.reducer';
import { SnackbarState } from '../../modules/snackbar/snackbar.types';
import { reducer as subscriptionReducer } from '../../modules/subscription/subscription.reducer';
import { SubscriptionState } from '../../modules/subscription/subscription.types';
//<-- IMPORT MODULE REDUCER -->

export type GlobalState = {
  locales: LocalesState;
  startup: StartupState;
  auth: AuthState;
  config: ConfigState;
  stripe: StripeState;
  snackbar: SnackbarState;
  subscription: SubscriptionState;
  //<-- INJECT MODULE STATE TYPE -->
};

export default function createReducer() {
  return combineReducers({
    locales: localesReducer,
    startup: startupReducer,
    auth: authReducer,
    config: configReducer,
    stripe: stripeReducer,
    snackbar: snackbarReducer,
    subscription: subscriptionReducer,
    //<-- INJECT MODULE REDUCER -->
  });
}
