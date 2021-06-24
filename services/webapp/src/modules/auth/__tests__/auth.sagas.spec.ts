import { expectSaga } from 'redux-saga-test-plan';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'http-status-codes';
import { identity } from 'ramda';
import { server } from '../../../mocks/server';
import { watchAuth } from '../auth.sagas';
import {
  mockChangePassword,
  mockConfirmEmail,
  mockConfirmPasswordReset,
  mockLogin,
  mockLogout,
  mockMe,
  mockRequestPasswordReset,
  mockSignup,
  mockUpdateProfile,
} from '../../../mocks/server/handlers';
import history from '../../../shared/utils/history';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory, userProfileFactory } from '../../../mocks/factories';
import { snackbarActions } from '../../snackbar';
import { OAuthProvider } from '../auth.types';
import { authActions } from '..';

jest.mock('../../../shared/utils/history');

const credentials = {
  email: 'user@mail.com',
  password: 'password',
};

describe('Auth: sagas', () => {
  const defaultState = prepareState(identity);
  const mockHistoryPush = history.push as jest.Mock;
  const profile = userProfileFactory();

  const originalLocation = window.location;
  const locationAssignSpy = jest.fn();

  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    window.location = {
      ...originalLocation,
      assign: locationAssignSpy,
    };
  });

  afterAll(() => (window.location = originalLocation));

  beforeEach(() => {
    mockHistoryPush.mockReset();
    locationAssignSpy.mockReset();
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
      server.use(mockLogin(BAD_REQUEST, { isError: true, password: [{ message: 'error', code: 'error' }] }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.login.resolved({ isError: true, password: [{ message: 'error', code: 'error' }] }))
        .dispatch(authActions.login(credentials))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockLogin(INTERNAL_SERVER_ERROR, { isError: true }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(authActions.login(credentials))
        .silentRun();
    });
  });

  describe('logout', () => {
    describe('call completes successfully', () => {
      it('should resolve action', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          // @ts-ignore
          .put(authActions.logout.resolved(''))
          .dispatch(authActions.logout())
          .silentRun();
      });

      describe('user is logged in', () => {
        it('should redirect to login page', async () => {
          const state = prepareState((state) => {
            state.auth = loggedInAuthFactory();
          });

          await expectSaga(watchAuth).withState(state).dispatch(authActions.logout()).silentRun();
          expect(mockHistoryPush).toHaveBeenCalledWith('/en/auth/login');
        });
      });

      describe('user is logged out', () => {
        it('should not redirect to login page', async () => {
          const state = prepareState((state) => {
            state.auth = loggedOutAuthFactory();
          });
          await expectSaga(watchAuth).withState(state).dispatch(authActions.logout()).silentRun();
          expect(mockHistoryPush).not.toHaveBeenCalled();
        });
      });
    });

    describe('call completes with error', () => {
      it('should not redirect anywhere', async () => {
        server.use(mockLogout(INTERNAL_SERVER_ERROR));
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.logout()).silentRun();
        expect(mockHistoryPush).not.toHaveBeenCalled();
      });
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

      it('should not redirect to login screen', async () => {
        server.use(mockMe(profile, UNAUTHORIZED));
        await expectSaga(watchAuth).withState(defaultState).dispatch(authActions.fetchProfile()).silentRun();
        expect(mockHistoryPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateProfile', () => {
    const updateProfilePayload = {
      firstName: 'John',
      lastName: 'Black',
    };
    const profile = userProfileFactory({ ...updateProfilePayload });

    it('should resolve action if call completes successfully', async () => {
      server.use(mockUpdateProfile({ ...profile, isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.updateProfile.resolved({ ...profile, isError: false }))
        .dispatch(authActions.updateProfile(updateProfilePayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockUpdateProfile({ isError: true }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.updateProfile.resolved({ isError: true }))
        .dispatch(authActions.updateProfile(updateProfilePayload))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockUpdateProfile({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(authActions.updateProfile(updateProfilePayload))
        .silentRun();
    });
  });

  describe('signup', () => {
    describe('call completes successfully', () => {
      it('should resolve action', async () => {
        server.use(mockSignup({ isError: false }));

        await expectSaga(watchAuth)
          .withState(defaultState)
          .put(authActions.signup.resolved({ isError: false }))
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
      server.use(mockSignup({ isError: true, password: [{ message: 'error', code: 'error' }] }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.signup.resolved({ isError: true, password: [{ message: 'error', code: 'error' }] }))
        .dispatch(authActions.signup(credentials))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockSignup({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
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
      server.use(
        mockChangePassword({ isError: true, oldPassword: [{ message: 'error', code: 'error' }] }, BAD_REQUEST)
      );

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.changePassword.resolved({ isError: true, oldPassword: [{ message: 'error', code: 'error' }] }))
        .dispatch(authActions.changePassword(changePasswordPayload))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockChangePassword({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
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

  describe('requestPasswordReset', () => {
    const requestPasswordResetPayload = {
      email: 'user@mail.com',
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockRequestPasswordReset({ isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.requestPasswordReset.resolved({ isError: false }))
        .dispatch(authActions.requestPasswordReset(requestPasswordResetPayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockRequestPasswordReset({ isError: true }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.requestPasswordReset.resolved({ isError: true }))
        .dispatch(authActions.requestPasswordReset(requestPasswordResetPayload))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockRequestPasswordReset({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(authActions.requestPasswordReset(requestPasswordResetPayload))
        .silentRun();
    });
  });

  describe('confirmPasswordReset', () => {
    const confirmPasswordResetPayload = {
      newPassword: 'user_id',
      user: 'user-id',
      token: 'token',
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockConfirmPasswordReset({ isError: false }));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.confirmPasswordReset.resolved({ isError: false }))
        .dispatch(authActions.confirmPasswordReset(confirmPasswordResetPayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockConfirmPasswordReset({ isError: true }, BAD_REQUEST));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(authActions.confirmPasswordReset.resolved({ isError: true }))
        .dispatch(authActions.confirmPasswordReset(confirmPasswordResetPayload))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      server.use(mockConfirmPasswordReset({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchAuth)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(authActions.confirmPasswordReset(confirmPasswordResetPayload))
        .silentRun();
    });
  });

  describe('oAuthLogin', () => {
    describe('for google provider', () => {
      it('should redirect to google OAuth url', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .dispatch(authActions.oAuthLogin(OAuthProvider.Google))
          .silentRun();
        const encodedNextUrl = encodeURIComponent('http://localhost');
        expect(locationAssignSpy).toHaveBeenCalledWith(`/api/auth/social/login/google-oauth2?next=${encodedNextUrl}`);
      });
    });

    describe('for facebook provider', () => {
      it('should redirect to facebook OAuth url', async () => {
        await expectSaga(watchAuth)
          .withState(defaultState)
          .dispatch(authActions.oAuthLogin(OAuthProvider.Facebook))
          .silentRun();
        const encodedNextUrl = encodeURIComponent('http://localhost');
        expect(locationAssignSpy).toHaveBeenCalledWith(`/api/auth/social/login/facebook?next=${encodedNextUrl}`);
      });
    });
  });
});
