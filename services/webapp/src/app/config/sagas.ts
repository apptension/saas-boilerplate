import { all, fork } from 'redux-saga/effects';
import { watchStartup } from '../../modules/startup/startup.sagas';
import { watchAuth } from '../../modules/auth/auth.sagas';
import { watchConfig } from '../../modules/config/config.sagas';
import { watchSnackbar } from '../../modules/snackbar/snackbar.sagas';
import { watchStripe } from '../../modules/stripe/stripe.sagas';
import { watchSubscription } from '../../modules/subscription/subscription.sagas';
//<-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
  yield all([
    fork(watchStartup),
    fork(watchAuth),
    fork(watchConfig),
    fork(watchStripe),
    fork(watchSnackbar),
    fork(watchSubscription),
    //<-- INJECT MODULE SAGA -->
  ]);
}
