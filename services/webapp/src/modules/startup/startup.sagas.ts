import { all, takeLeading, put, select, take, race } from 'redux-saga/effects';
import { empty } from 'ramda';
import { authActions } from '../auth';
import { reportError } from '../../shared/utils/reportError';
import { selectIsProfileStartupCompleted } from './startup.selectors';
import { startupActions } from '.';

function* handleProfileStartup() {
  try {
    const isStartupCompleted: boolean = yield select(selectIsProfileStartupCompleted);
    if (!isStartupCompleted) {
      yield put(authActions.fetchProfile());
      yield race({
        resolve: take(authActions.fetchProfile.resolved, empty),
        reject: take(authActions.fetchProfile.rejected, empty),
      });
      yield put(startupActions.completeProfileStartup());
    }
  } catch (ex) {
    reportError(ex);
  }
}

export function* watchStartup() {
  yield all([takeLeading(startupActions.startup, handleProfileStartup)]);
}
