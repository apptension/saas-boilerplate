import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { produce } from 'immer';

import { RoutesConfig } from '../../../../../app/config/routes';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';
import { createMockRouterHistory, render } from '../../../../../tests/utils/rendering';
import { unpackPromise } from '../../../../../tests/utils/promise';
import { server } from '../../../../../mocks/server';
import { mockConfirmPasswordReset } from '../../../../../mocks/server/handlers';
import configureStore from '../../../../../app/config/store';
import { prepareState } from '../../../../../mocks/store';
import { loggedOutAuthFactory } from '../../../../../mocks/factories';

describe('PasswordResetConfirm: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['passwordReset', 'confirm'])} element={<PasswordResetConfirm />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={<span>Login page mock</span>} />
    </Routes>
  );

  const user = 'mock-user';
  const token = 'mock-token';
  const routePath = ['passwordReset', 'confirm'];
  const reduxInitialState = prepareState((state) => {
    state.auth = loggedOutAuthFactory();
    state.startup.profileStartupCompleted = true;
  });

  describe('token is valid', () => {
    const newPassword = 'asdf1234';

    it('should redirect to login', async () => {
      const routerHistory = createMockRouterHistory(routePath, { user, token });
      const reduxStore = configureStore(reduxInitialState);
      const { promise: apiDelayPromise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmPasswordReset({ isError: false }, 200, apiDelayPromise));

      render(<Component />, { routerHistory, reduxStore });

      await userEvent.type(screen.getByLabelText(/^new password$/i), newPassword);
      await userEvent.type(screen.getByLabelText(/^repeat new password$/i), newPassword);
      await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }));

      await act(async () => resolveApiCall());

      expect(screen.getByText(/login page mock/i)).toBeInTheDocument();
    });

    it('should show a success message', async () => {
      const routerHistory = createMockRouterHistory(routePath, { user, token });
      const reduxStore = configureStore(reduxInitialState);
      const { promise: apiDelayPromise, resolve: resolveApiCall } = unpackPromise();
      server.use(mockConfirmPasswordReset({ isError: false }, 200, apiDelayPromise));

      render(<Component />, { routerHistory, reduxStore });

      await userEvent.type(screen.getByLabelText(/^new password$/i), newPassword);
      await userEvent.type(screen.getByLabelText(/^repeat new password$/i), newPassword);
      await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }));
      await act(async () => resolveApiCall());

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: '🎉 Password reset successfully!' }];
        })
      );
    });
  });

  describe('token is invalid', () => {
    it('should redirect to login page', async () => {
      const routerHistory = createMockRouterHistory(routePath, { user, token });
      const reduxStore = configureStore(reduxInitialState);
      const { promise: apiDelayPromise, resolve: resolveApiCall } = unpackPromise();
      server.use(
        mockConfirmPasswordReset(
          {
            isError: true,
            nonFieldErrors: [{ code: 'invalid_token' }],
          },
          400,
          apiDelayPromise
        )
      );

      render(<Component />, { routerHistory, reduxStore });

      await userEvent.type(screen.getByLabelText(/^new password$/i), 'some pass');
      await userEvent.type(screen.getByLabelText(/^repeat new password$/i), 'some pass');
      await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }));
      await act(async () => {
        resolveApiCall();
      });

      expect(screen.getByText(/Malformed password reset token/i)).toBeInTheDocument();
    });
  });
});
