import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../../app/config/routes';
import { authRequestPasswordResetConfirmMutation } from '../../../../../shared/components/auth/passwordResetConfirmForm/passwordResetConfirmForm.graphql';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';

const newPassword = 'new-password';
const user = 'user-id';
const token = 'token-value';

const defaultVariables = {
  input: { newPassword, user, token },
};

const LoginPageMock = <span>Login page mock</span>;

describe('PasswordResetConfirm: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.passwordReset.confirm)} element={<PasswordResetConfirm />} />
      <Route path={getLocalePath(RoutesConfig.login)} element={LoginPageMock} />
      <Route path="*" element={LoginPageMock} />
    </Routes>
  );

  const routePath = RoutesConfig.passwordReset.confirm;

  const fillForm = async (newPassword: string) => {
    await userEvent.type(await screen.findByLabelText(/^new password$/i), newPassword);
    await userEvent.type(screen.getByLabelText(/^repeat new password$/i), newPassword);
  };

  const sendForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }));
  };

  describe('token is valid', () => {
    it('should redirect to login', async () => {
      const routerProps = createMockRouterProps(routePath, { user, token });
      const requestMock = composeMockedQueryResult(authRequestPasswordResetConfirmMutation, {
        variables: defaultVariables,
        data: {
          passwordResetConfirm: {
            ok: true,
          },
        },
      });

      render(<Component />, { routerProps, apolloMocks: append(requestMock) });

      await fillForm(newPassword);
      await sendForm();

      expect(await screen.findByText(/login page mock/i)).toBeInTheDocument();
    });
  });

  describe('token is missing', () => {
    it('should redirect to login page', async () => {
      const routerProps = createMockRouterProps(routePath, { user, token: '' });

      render(<Component />, { routerProps });

      expect(await screen.findByText(/login page mock/i)).toBeInTheDocument();
    });
  });
});
