import { all, put, takeLatest } from 'redux-saga/effects';

import { reportError } from '../../shared/utils/reportError';
import { PromiseAction, resolvePromiseAction, rejectPromiseAction } from '../../shared/utils/reduxSagaPromise';
import { auth } from '../../shared/services/api';
import {
  LoginApiRequestData,
  LoginApiResponseData,
  MeApiResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../shared/services/api/auth/types';
import * as authActions from './auth.actions';
import { fetchProfileSuccess } from './auth.actions';

function* signup(action: PromiseAction<SignupApiRequestData, SignupApiResponseData>) {
  try {
    const res = yield auth.signup(action.payload);
    yield resolvePromiseAction(action, res);
  } catch (error) {
    reportError(error);
    yield rejectPromiseAction(action, error.response.data);
  }
}

function* login(action: PromiseAction<LoginApiRequestData, LoginApiResponseData>) {
  try {
    const res: LoginApiResponseData = yield auth.login(action.payload);
    yield resolvePromiseAction(action, res);
  } catch (error) {
    reportError(error);
    yield rejectPromiseAction(action, error.response.data);
  }
}

function* fetchProfile() {
  try {
    const res: MeApiResponseData = yield auth.me();
    yield put(fetchProfileSuccess(res));
  } catch (error) {
    reportError(error);
  }
}

export function* watchAuth() {
  yield all([
    takeLatest(authActions.signup, signup),
    takeLatest(authActions.login, login),
    takeLatest(authActions.fetchProfile, fetchProfile),
  ]);
}
