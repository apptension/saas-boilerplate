import { all, takeLatest, put } from 'redux-saga/effects';
import { authActions } from '../auth';
import { startupActions } from '.';

export function* handleStartup() {
  yield put(authActions.fetchProfile());
}

export function* watchStartup() {
  yield all([takeLatest(startupActions.startup, handleStartup)]);
}
