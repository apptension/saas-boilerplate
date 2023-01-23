import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { produce } from 'immer';
import { createMockEnvironment, MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { RoutesConfig } from '../../../../../app/config/routes';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import configureStore from '../../../../../app/config/store';
import { prepareState } from '../../../../../mocks/store';
import { fillCommonQueryWithUser } from '../../../../../shared/utils/commonQuery';

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
  const reduxInitialState = prepareState((state) => state);

  let relayEnvironment: RelayMockEnvironment;

  const fillForm = async (newPassword: string) => {
    await userEvent.type(screen.getByLabelText(/^new password$/i), newPassword);
    await userEvent.type(screen.getByLabelText(/^repeat new password$/i), newPassword);
  };

  const sendForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }));
  };

  beforeEach(() => {
    relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
  });

  describe('token is valid', () => {
    const newPassword = 'asdf1234';

    it('should redirect to login', async () => {
      const routerProps = createMockRouterProps(routePath, { user, token });

      render(<Component />, { routerProps, relayEnvironment });

      await act(async () => {
        await fillForm(newPassword);
        await sendForm();
      });

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(screen.getByText(/login page mock/i)).toBeInTheDocument();
    });

    it('should show a success message', async () => {
      const routerProps = createMockRouterProps(routePath, { user, token });
      const reduxStore = configureStore(reduxInitialState);

      render(<Component />, { routerProps, reduxStore, relayEnvironment });

      await act(async () => {
        await fillForm(newPassword);
        await sendForm();
      });

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

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
      const routerProps = createMockRouterProps(routePath, { user, token });

      render(<Component />, { routerProps, relayEnvironment });

      await act(async () => {
        await fillForm('some pass');
        await sendForm();
      });

      const errorMessage = 'Invalid Token';

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, {
          ...MockPayloadGenerator.generate(operation),
          errors: [
            {
              message: 'GraphQlValidationError',
              extensions: {
                nonFieldErrors: [
                  {
                    message: errorMessage,
                    code: 'invalid_token',
                  },
                ],
              },
            },
          ],
        } as any);
      });

      expect(screen.getByText(/Malformed password reset token/i)).toBeInTheDocument();
    });
  });
});
