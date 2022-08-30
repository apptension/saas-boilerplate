import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { produce } from 'immer';
import { ConfirmEmail } from '../confirmEmail.component';
import { RoutesConfig } from '../../../../app/config/routes';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory } from '../../../../mocks/factories';
import { createMockRouterHistory, render } from '../../../../tests/utils/rendering';
import { server } from '../../../../mocks/server';
import { mockConfirmEmail } from '../../../../mocks/server/handlers';
import { unpackPromise } from '../../../../tests/utils/promise';
import configureStore from '../../../../app/config/store';

describe('ConfirmEmail: Component', () => {
  const user = 'user_id';
  const token = 'token';
  const reduxInitialState = prepareState((state) => {
    state.auth = loggedOutAuthFactory();
    state.startup.profileStartupCompleted = true;
  });

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['confirmEmail'])} element={<ConfirmEmail />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={<span>Login page mock</span>} />
    </Routes>
  );

  describe('token is invalid', () => {
    it('should redirect to login ', async () => {
      const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
      const { promise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmEmail({ isError: true }, 400, promise));

      render(<Component />, { reduxInitialState, routerHistory });
      await act(async () => resolveApiCall());

      expect(screen.getByText('Login page mock')).toBeInTheDocument();
    });

    it('should show error message', async () => {
      const reduxStore = configureStore(reduxInitialState);
      const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
      const { promise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmEmail({ isError: true }, 400, promise));

      render(<Component />, { reduxStore, routerHistory });
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
    describe('user is logged out', () => {
      it('should redirect to login ', async () => {
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxInitialState, routerHistory });
        await act(async () => resolveApiCall());

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(reduxInitialState);
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxStore, routerHistory });
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
      const loggedInReduxState = prepareState((state) => {
        state.auth = loggedInAuthFactory();
        state.startup.profileStartupCompleted = true;
      });

      it('should redirect to login ', async () => {
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxInitialState: loggedInReduxState, routerHistory });
        await act(async () => resolveApiCall());

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(loggedInReduxState);
        const routerHistory = createMockRouterHistory('confirmEmail', { user, token });
        const { promise, resolve: resolveApiCall } = unpackPromise();
        server.use(mockConfirmEmail({ isError: false }, 200, promise));

        render(<Component />, { reduxStore, routerHistory });
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
