import { all, takeLatest } from 'redux-saga/effects';
import { startupActions } from '.';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function* handleStartup() {}

export function* watchStartup() {
  yield all([takeLatest(startupActions.startup, handleStartup)]);
}
