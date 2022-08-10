import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {makeContextRenderer, packHistoryArgs, spiedHistory} from '../../../../../shared/utils/testUtils';
import { Routes } from '../../../../../app/config/routes';
import { confirmPasswordReset } from '../../../../../modules/auth/auth.actions';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';

const user = 'user_id';
const token = 'token';
const confirmResetRoute = `/en/auth/reset-password/confirm/${user}/${token}`;
const confirmResetRouteNoToken = `/en/auth/reset-password/confirm`;

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('PasswordResetConfirm: Component', () => {
  const component = () => <PasswordResetConfirm />;
  const render = makeContextRenderer(component);
  const routePath = Routes.getLocalePath(['passwordReset', 'confirm']);
  const routePathRoot = Routes.getLocalePath(['passwordReset', 'confirmRoot']);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should hide token and user from URL', async () => {
    const { pushSpy, history } = spiedHistory(confirmResetRoute);
    render({}, { router: { history, routePath } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/auth/reset-password/confirm'));
    });
  });

  it('should call changePassword action with token and user when submitted', async () => {
    const newPassword = 'asdf1234';
    mockDispatch.mockResolvedValue({ isError: false });

    const { history } = spiedHistory(confirmResetRoute);
    render({}, { router: { history, routePath } });
    await userEvent.type(screen.getByLabelText(/^new password$/i), newPassword);
    await userEvent.type(screen.getByLabelText(/^repeat new password$/i), newPassword);
    await userEvent.click(screen.getByRole('button', { name: /confirm the change/i }))
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        confirmPasswordReset({
          newPassword,
          token,
          user,
        })
      );
    });
  });

  it('should redirect to login if there is invalid token or user in URL', async () => {
    const { pushSpy, history } = spiedHistory(confirmResetRouteNoToken);
    render({}, { router: { history, routePath: routePathRoot } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/auth/login'));
    });
  });
});
