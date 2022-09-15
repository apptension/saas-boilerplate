import { all, fork } from 'redux-saga/effects';
import { watchAuth } from '../../modules/auth/auth.sagas';
import { watchConfig } from '../../modules/config/config.sagas';
import { watchSnackbar } from '../../modules/snackbar/snackbar.sagas';
import { watchStripe } from '../../modules/stripe/stripe.sagas';
//<-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchConfig),
    fork(watchStripe),
    fork(watchSnackbar),
    //<-- INJECT MODULE SAGA -->
  ]);
}
