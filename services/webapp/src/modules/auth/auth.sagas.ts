import { all, put, takeLatest } from 'redux-saga/effects';

import { auth } from '../../shared/services/api';
import { LoginApiResponseData, MeApiResponseData, SignupApiResponseData } from '../../shared/services/api/auth/types';
import { ROUTES } from '../../routes/app.constants';
import { handleApiError, handleApiRequest, navigate } from '../helpers';
import * as authActions from './auth.actions';
import { fetchProfileSuccess } from './auth.actions';

function* loginResolve(response: LoginApiResponseData) {
  if (!response.isError) {
    yield navigate(ROUTES.home);
    yield put(authActions.fetchProfile());
  }
}

function* signupResolve(response: SignupApiResponseData) {
  if (!response.isError) {
    yield navigate(ROUTES.home);
    yield put(authActions.fetchProfile());
  }
}

function* fetchProfile() {
  try {
    const res: MeApiResponseData = yield auth.me();
    yield put(fetchProfileSuccess(res));
  } catch (error) {
    yield handleApiError(error);
  }
}

export function* watchAuth() {
  yield all([
    takeLatest(authActions.signup, handleApiRequest(auth.signup, signupResolve)),
    takeLatest(authActions.login, handleApiRequest(auth.login, loginResolve)),
    takeLatest(authActions.changePassword, handleApiRequest(auth.changePassword)),
    takeLatest(authActions.fetchProfile, fetchProfile),
  ]);
}
