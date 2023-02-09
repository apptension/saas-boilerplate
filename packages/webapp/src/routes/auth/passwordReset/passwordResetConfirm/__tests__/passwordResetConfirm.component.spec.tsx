import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { append } from 'ramda';

import { RoutesConfig } from '../../../../../app/config/routes';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';

import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { authRequestPasswordResetConfirmMutation } from '../../../../../shared/components/auth/passwordResetConfirmForm/passwordResetConfirmForm.graphql';

const newPassword = 'new-password';
const user = 'user-id';
const token = 'token-value';

const defaultVariables = {
  input: { newPassword, user, token },
};

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});
const LoginPageMock = <span>Login page mock</span>;
describe('PasswordResetConfirm: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });
  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['passwordReset', 'confirm'])} element={<PasswordResetConfirm />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={LoginPageMock} />
      <Route path="*" element={LoginPageMock} />
    </Routes>
  );

  const routePath = ['passwordReset', 'confirm'];

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
