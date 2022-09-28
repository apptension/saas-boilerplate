import { actionCreator } from '../helpers/actionCreator';
import { OAuthProvider } from './auth.types';

const { createPromiseAction } = actionCreator('AUTH');

export const oAuthLogin = createPromiseAction<OAuthProvider, void>('OAUTH_LOGIN');
