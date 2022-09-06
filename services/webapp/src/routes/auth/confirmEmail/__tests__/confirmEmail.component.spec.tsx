import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { produce } from 'immer';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';

import { ConfirmEmail } from '../confirmEmail.component';
import { RoutesConfig } from '../../../../app/config/routes';
import { prepareState } from '../../../../mocks/store';
import { currentUserFactory } from '../../../../mocks/factories';
import { createMockRouterHistory, render } from '../../../../tests/utils/rendering';
import { server } from '../../../../mocks/server';
import { mockConfirmEmail } from '../../../../mocks/server/handlers';
import { unpackPromise } from '../../../../tests/utils/promise';
import configureStore from '../../../../app/config/store';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { Role } from '../../../../modules/auth/auth.types';

describe('ConfirmEmail: Component', () => {
  const user = 'user_id';
  const token = 'token';
  const reduxInitialState = prepareState((state) => state);

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['confirmEmail'])} element={<ConfirmEmail />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={<span>Login page mock</span>} />
    </Routes>
  );

  describe('token is invalid', () => {
    let relayEnvironment: RelayMockEnvironment;

    beforeEach(() => {
      relayEnvironment = createMockEnvironment();
      fillCommonQueryWithUser(relayEnvironment);
    });

    it('should redirect to login ', async () => {
      const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
      const { promise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmEmail({ isError: true }, 400, promise));

      render(<Component />, { reduxInitialState, routerHistory, relayEnvironment });
      await act(async () => resolveApiCall());

      expect(screen.getByText('Login page mock')).toBeInTheDocument();
    });

    it('should show error message', async () => {
      const reduxStore = configureStore(reduxInitialState);
      const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
      const { promise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmEmail({ isError: true }, 400, promise));

      render(<Component />, { reduxStore, routerHistory, relayEnvironment });
      await act(async () => resolveApiCall());

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: 'Invalid token.' }];
        })
      );
    });
  });

  describe('token is valid', () => {
    let relayEnvironment: RelayMockEnvironment;

    beforeEach(() => {
      relayEnvironment = createMockEnvironment();
      fillCommonQueryWithUser(relayEnvironment);
    });

    describe('user is logged out', () => {
      it('should redirect to login ', async () => {
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxInitialState, routerHistory, relayEnvironment });
        await act(async () => resolveApiCall());

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(reduxInitialState);
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxStore, routerHistory, relayEnvironment });
        await act(async () => resolveApiCall());

        expect(reduxStore.getState()).toEqual(
          produce(reduxInitialState, (state) => {
            state.snackbar.lastMessageId = 1;
            state.snackbar.messages = [{ id: 1, text: 'Congratulations! Now you can log in.' }];
          })
        );
      });
    });

    describe('user is logged in', () => {
      const loggedInReduxState = prepareState((state) => state);

      let relayEnvironment: RelayMockEnvironment;

      beforeEach(() => {
        relayEnvironment = createMockEnvironment();
        fillCommonQueryWithUser(
          relayEnvironment,
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        );
      });

      it('should redirect to login ', async () => {
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxInitialState: loggedInReduxState, routerHistory, relayEnvironment });
        await act(async () => resolveApiCall());

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(loggedInReduxState);
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxStore, routerHistory, relayEnvironment });
        await act(async () => resolveApiCall());

        expect(reduxStore.getState()).toEqual(
          produce(loggedInReduxState, (state) => {
            state.snackbar.lastMessageId = 1;
            state.snackbar.messages = [{ id: 1, text: 'Congratulations! Your email has been confirmed.' }];
          })
        );
      });
    });
  });
});
