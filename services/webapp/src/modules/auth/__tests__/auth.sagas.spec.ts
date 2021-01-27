import { expectSaga } from 'redux-saga-test-plan';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';

import { watchAuth } from '../auth.sagas';
import { authActions } from '..';
import { server } from '../../../mocks/server';
import { mockLogin, mockMe, mockSignup } from '../../../mocks/server/handlers';

const mockCredentials = {
  email: 'user@mail.com',
  password: 'password',
};

describe('Auth: sagas', () => {
  const defaultState = {};

  describe('login', () => {
    it('should resolve action if call completes successfully', async () => {
      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.login.resolved({ isError: false }))
        .dispatch(authActions.login(mockCredentials))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockLogin(BAD_REQUEST, { isError: true, password: { message: 'error' } }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.login.resolved({ isError: true, password: { message: 'error' } }))
        .dispatch(authActions.login(mockCredentials))
        .silentRun();
    });
  });

  describe('fetchProfile', () => {
    it('should call success action if call completes successfully', async () => {
      const MOCK_PROFILE = { firstName: 'username' };
      server.use(mockMe(MOCK_PROFILE, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.fetchProfileSuccess(MOCK_PROFILE))
        .dispatch(authActions.fetchProfile())
        .silentRun();
    });

    it('should not call success action if call completes with UNAUTHORIZED error', async () => {
      server.use(mockMe({}, UNAUTHORIZED));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .not.put(authActions.fetchProfileSuccess({}))
        .dispatch(authActions.fetchProfile())
        .silentRun();
    });
  });

  describe('signup', () => {
    it('should resolve action if call completes successfully', async () => {
      const MOCK_PROFILE = { email: 'test@gm.com', id: '123', profile: {} };
      server.use(mockSignup({ isError: false, ...MOCK_PROFILE }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.signup.resolved({ isError: false, ...MOCK_PROFILE }))
        .dispatch(authActions.signup(mockCredentials))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockSignup({ isError: true, password: { message: 'error' } }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.signup.resolved({ isError: true, password: { message: 'error' } }))
        .dispatch(authActions.signup(mockCredentials))
        .silentRun();
    });
  });
});
