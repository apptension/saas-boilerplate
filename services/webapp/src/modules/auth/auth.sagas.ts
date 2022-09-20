import { all, takeLatest } from 'redux-saga/effects';
import { auth } from '../../shared/services/api';
import { PromiseAction } from '../../shared/utils/reduxSagaPromise';
import { getOauthUrl } from '../../shared/services/api/auth';
import { handleApiRequest } from '../helpers/handleApiRequest';
import { OAuthProvider } from './auth.types';
import * as authActions from './auth.actions';

function* oAuthLogin({ payload: provider }: PromiseAction<OAuthProvider>) {
  yield window.location.assign(getOauthUrl(provider));
}

export function* watchAuth() {
  yield all([
    takeLatest(authActions.changePassword, handleApiRequest(auth.changePassword)),
    takeLatest(authActions.confirmEmail, handleApiRequest(auth.confirmEmail)),
    takeLatest(authActions.requestPasswordReset, handleApiRequest(auth.requestPasswordReset)),
    takeLatest(authActions.confirmPasswordReset, handleApiRequest(auth.confirmPasswordReset)),
    takeLatest(authActions.oAuthLogin, oAuthLogin),
  ]);
}
