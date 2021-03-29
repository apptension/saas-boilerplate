import { all, put, takeLatest, select } from 'redux-saga/effects';

import { auth } from '../../shared/services/api';
import { LoginApiResponseData, SignupApiResponseData } from '../../shared/services/api/auth/types';
import { ROUTES } from '../../routes/app.constants';
import { handleApiRequest } from '../helpers/handleApiRequest';
import { navigate } from '../helpers/navigate';
import { PromiseAction } from '../../shared/utils/reduxSagaPromise';
import { getOauthUrl } from '../../shared/services/api/auth';
import { OAuthProvider } from './auth.types';
import * as authActions from './auth.actions';
import { selectIsLoggedIn } from './auth.selectors';

function* loginResolve(response: LoginApiResponseData) {
  if (!response.isError) {
    yield navigate(ROUTES.home);
    yield put(authActions.fetchProfile());
  }
}

function* logoutResolve() {
  const isLoggedIn = yield select(selectIsLoggedIn);
  if (isLoggedIn) {
    yield put(authActions.resetProfile());
    yield navigate(ROUTES.login);
  }
}

function* signupResolve(response: SignupApiResponseData) {
  if (!response.isError) {
    yield navigate(ROUTES.home);
    yield put(authActions.fetchProfile());
  }
}

function* oAuthLogin({ payload: provider }: PromiseAction<OAuthProvider>) {
  yield window.location.assign(getOauthUrl(provider));
}

export function* watchAuth() {
  yield all([
    takeLatest(authActions.signup, handleApiRequest(auth.signup, { onResolve: signupResolve })),
    takeLatest(authActions.login, handleApiRequest(auth.login, { onResolve: loginResolve })),
    takeLatest(authActions.logout, handleApiRequest(auth.logout)),
    takeLatest(authActions.logout.resolved, logoutResolve),
    takeLatest(authActions.changePassword, handleApiRequest(auth.changePassword)),
    takeLatest(authActions.fetchProfile, handleApiRequest(auth.me, { redirectToLoginOnFail: false })),
    takeLatest(authActions.updateProfile, handleApiRequest(auth.updateProfile)),
    takeLatest(authActions.confirmEmail, handleApiRequest(auth.confirmEmail)),
    takeLatest(authActions.requestPasswordReset, handleApiRequest(auth.requestPasswordReset)),
    takeLatest(authActions.confirmPasswordReset, handleApiRequest(auth.confirmPasswordReset)),
    takeLatest(authActions.oAuthLogin, oAuthLogin),
  ]);
}
