import { expectSaga } from 'redux-saga-test-plan';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';

import { identity } from 'ramda';
import { watchAuth } from '../auth.sagas';
import { authActions } from '..';
import { server } from '../../../mocks/server';
import { mockChangePassword, mockLogin, mockMe, mockSignup } from '../../../mocks/server/handlers';
import history from '../../../shared/utils/history';
import { prepareState } from '../../../mocks/store';

jest.mock('../../../shared/utils/history');

const mockCredentials = {
  email: 'user@mail.com',
  password: 'password',
};

describe('Auth: sagas', () => {
  const defaultState = prepareState(identity);
  const mockHistoryPush = history.push as jest.Mock;

  beforeEach(() => {
    mockHistoryPush.mockReset();
  });

  describe('login', () => {
    describe('call completes successfully', () => {
      it('should resolve action', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.login.resolved({ isError: false }))
          .dispatch(authActions.login(mockCredentials))
          .silentRun();
      });

      it('should redirect to homepage', async () => {
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.login(mockCredentials)).silentRun();
        expect(mockHistoryPush).toHaveBeenCalledWith('/en/');
      });
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockLogin(BAD_REQUEST, { isError: true, password: ['error'] }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.login.resolved({ isError: true, password: ['error'] }))
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

    describe('call completes with UNAUTHORIZED error', () => {
      it('should not call success action', async () => {
        server.use(mockMe({}, UNAUTHORIZED));

        await expectSaga(watchAuth)
          .withState(defaultState)
          .not.put(authActions.fetchProfileSuccess({}))
          .dispatch(authActions.fetchProfile())
          .silentRun();
      });

      it('should redirect to login screen', async () => {
        server.use(mockMe({}, UNAUTHORIZED));
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.fetchProfile()).silentRun();
        expect(mockHistoryPush).toHaveBeenCalledWith('/en/auth/login');
      });
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
      server.use(mockSignup({ isError: true, password: ['error'] }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.signup.resolved({ isError: true, password: ['error'] }))
        .dispatch(authActions.signup(mockCredentials))
        .silentRun();
    });
  });

  describe('changePassword', () => {
    const mockChangePasswordPayload = {
      oldPassword: 'old-pass',
      newPassword: 'new-pass',
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockChangePassword({ isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.changePassword.resolved({ isError: false }))
        .dispatch(authActions.changePassword(mockChangePasswordPayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockChangePassword({ isError: true, oldPassword: ['error'] }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.changePassword.resolved({ isError: true, oldPassword: ['error'] }))
        .dispatch(authActions.changePassword(mockChangePasswordPayload))
        .silentRun();
    });
  });
});
