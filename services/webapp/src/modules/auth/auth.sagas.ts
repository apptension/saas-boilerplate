import { all, takeLatest } from 'redux-saga/effects';
import { PromiseAction } from '../../shared/utils/reduxSagaPromise';
import { getOauthUrl } from '../../shared/services/api/auth';
import { OAuthProvider } from './auth.types';
import * as authActions from './auth.actions';

function* oAuthLogin({ payload: provider }: PromiseAction<OAuthProvider>) {
  yield window.location.assign(getOauthUrl(provider));
}

export function* watchAuth() {
  yield all([takeLatest(authActions.oAuthLogin, oAuthLogin)]);
}
