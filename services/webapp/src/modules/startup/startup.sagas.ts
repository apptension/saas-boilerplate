import { all, takeLeading, put, select, take } from 'redux-saga/effects';
import { empty } from 'ramda';
import { authActions } from '../auth';
import { reportError } from '../../shared/utils/reportError';
import { selectIsProfileStartupCompleted } from './startup.selectors';
import { startupActions } from '.';

function* handleProfileStartup() {
  try {
    const isStartupCompleted = yield select(selectIsProfileStartupCompleted);
    if (!isStartupCompleted) {
      yield put(authActions.fetchProfile());
      yield take(authActions.fetchProfile.resolved, empty);
      yield put(startupActions.completeProfileStartup());
    }
  } catch (ex) {
    reportError(ex);
  }
}

export function* watchStartup() {
  yield all([takeLeading(startupActions.profileStartup, handleProfileStartup)]);
}
