import { expectSaga } from 'redux-saga-test-plan';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';

import { identity } from 'ramda';
import { watchAuth } from '../auth.sagas';
import { authActions } from '..';
import { server } from '../../../mocks/server';
import { mockChangePassword, mockConfirmEmail, mockLogin, mockMe, mockSignup } from '../../../mocks/server/handlers';
import history from '../../../shared/utils/history';
import { prepareState } from '../../../mocks/store';
import { userProfileFactory } from '../../../mocks/factories';

jest.mock('../../../shared/utils/history');

const credentials = {
  email: 'user@mail.com',
  password: 'password',
};

describe('Auth: sagas', () => {
  const defaultState = prepareState(identity);
  const mockHistoryPush = history.push as jest.Mock;
  const profile = userProfileFactory();

  beforeEach(() => {
    mockHistoryPush.mockReset();
  });

  describe('login', () => {
    describe('call completes successfully', () => {
      it('should resolve action', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.login.resolved({ isError: false }))
          .dispatch(authActions.login(credentials))
          .silentRun();
      });

      it('should redirect to homepage', async () => {
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.login(credentials)).silentRun();
        expect(mockHistoryPush).toHaveBeenCalledWith('/en/');
      });

      it('should fetch user profile', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.fetchProfile())
          .dispatch(authActions.login(credentials))
          .silentRun();
      });
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockLogin(BAD_REQUEST, { isError: true, password: ['error'] }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.login.resolved({ isError: true, password: ['error'] }))
        .dispatch(authActions.login(credentials))
        .silentRun();
    });
  });

  describe('fetchProfile', () => {
    describe('call completes successfully', () => {
      it('should call success action', async () => {
        server.use(mockMe(profile));

        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.fetchProfile.resolved(profile))
          .dispatch(authActions.fetchProfile())
          .silentRun();
      });
    });

    describe('call completes with UNAUTHORIZED error', () => {
      it('should not call success action', async () => {
        server.use(mockMe(profile, UNAUTHORIZED));

        await expectSaga(watchAuth)
          .withState(defaultState)
          .not.put(authActions.fetchProfile.resolved(profile))
          .dispatch(authActions.fetchProfile())
          .silentRun();
      });

      it('should redirect to login screen', async () => {
        server.use(mockMe(profile, UNAUTHORIZED));
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.fetchProfile()).silentRun();
        expect(mockHistoryPush).toHaveBeenCalledWith('/en/auth/login');
      });
    });
  });

  describe('signup', () => {
    describe('call completes successfully', () => {
      it('should resolve action', async () => {
        server.use(mockSignup({ isError: false, profile }));

        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.signup.resolved({ isError: false, profile }))
          .dispatch(authActions.signup(credentials))
          .silentRun();
      });

      it('should redirect to homepage', async () => {
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.signup(credentials)).silentRun();
        expect(mockHistoryPush).toHaveBeenCalledWith('/en/');
      });

      it('should fetch user profile', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.fetchProfile())
          .dispatch(authActions.signup(credentials))
          .silentRun();
      });
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockSignup({ isError: true, password: ['error'] }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.signup.resolved({ isError: true, password: ['error'] }))
        .dispatch(authActions.signup(credentials))
        .silentRun();
    });
  });

  describe('changePassword', () => {
    const changePasswordPayload = {
      oldPassword: 'old-pass',
      newPassword: 'new-pass',
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockChangePassword({ isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.changePassword.resolved({ isError: false }))
        .dispatch(authActions.changePassword(changePasswordPayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockChangePassword({ isError: true, oldPassword: ['error'] }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.changePassword.resolved({ isError: true, oldPassword: ['error'] }))
        .dispatch(authActions.changePassword(changePasswordPayload))
        .silentRun();
    });
  });

  describe('confirmEmail', () => {
    const confirmEmailPayload = {
      user: 'user_id',
      token: 'token_value',
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockConfirmEmail({ isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.confirmEmail.resolved({ isError: false }))
        .dispatch(authActions.confirmEmail(confirmEmailPayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockConfirmEmail({ isError: true }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.confirmEmail.resolved({ isError: true }))
        .dispatch(authActions.confirmEmail(confirmEmailPayload))
        .silentRun();
    });
  });
});
