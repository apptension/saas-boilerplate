import { all, fork } from 'redux-saga/effects';
import { watchAuth } from '../../modules/auth/auth.sagas';
import { watchConfig } from '../../modules/config/config.sagas';
import { watchSnackbar } from '../../modules/snackbar/snackbar.sagas';
//<-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchConfig),
    fork(watchSnackbar),
    //<-- INJECT MODULE SAGA -->
  ]);
}
