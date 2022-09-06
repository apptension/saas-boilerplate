import { all, put, takeLatest } from 'redux-saga/effects';
import { RoutesConfig } from '../../app/config/routes';
import { auth } from '../../shared/services/api';
import { SignupApiResponseData } from '../../shared/services/api/auth/types';
import { PromiseAction } from '../../shared/utils/reduxSagaPromise';
import { getOauthUrl } from '../../shared/services/api/auth';
import { handleApiRequest } from '../helpers/handleApiRequest';
import { navigate } from '../helpers/navigate';
import { invalidateRelayStore } from '../../shared/services/graphqlApi/relayEnvironment';
import { OAuthProvider } from './auth.types';
import * as authActions from './auth.actions';

function* logoutResolve() {
  invalidateRelayStore();
  yield put(authActions.resetProfile());
  yield navigate(RoutesConfig.getLocalePath(['login']));
}

function* signupResolve(response: SignupApiResponseData) {
  if (!response.isError) {
    invalidateRelayStore();
    yield navigate(RoutesConfig.getLocalePath(['home']));
  }
}

function* oAuthLogin({ payload: provider }: PromiseAction<OAuthProvider>) {
  yield window.location.assign(getOauthUrl(provider));
}

export function* watchAuth() {
  yield all([
    takeLatest(authActions.signup, handleApiRequest(auth.signup, { onResolve: signupResolve })),
    takeLatest(authActions.logout, handleApiRequest(auth.logout)),
    takeLatest(authActions.logout.resolved, logoutResolve),
    takeLatest(authActions.changePassword, handleApiRequest(auth.changePassword)),
    takeLatest(authActions.confirmEmail, handleApiRequest(auth.confirmEmail)),
    takeLatest(authActions.requestPasswordReset, handleApiRequest(auth.requestPasswordReset)),
    takeLatest(authActions.confirmPasswordReset, handleApiRequest(auth.confirmPasswordReset)),
    takeLatest(authActions.oAuthLogin, oAuthLogin),
  ]);
}
