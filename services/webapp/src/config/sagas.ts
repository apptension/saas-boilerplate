import { all, fork } from 'redux-saga/effects';

import { watchStartup } from '../modules/startup/startup.sagas';
import { watchAuth } from '../modules/auth/auth.sagas';
import { watchConfig } from '../modules/config/config.sagas';
//<-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
  yield all([
    fork(watchStartup),
    fork(watchAuth),
    fork(watchConfig),
    //<-- INJECT MODULE SAGA -->
  ]);
}
