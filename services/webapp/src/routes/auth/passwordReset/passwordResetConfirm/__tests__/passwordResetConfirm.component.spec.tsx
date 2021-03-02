import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';
import { makeContextRenderer, spiedHistory } from '../../../../../shared/utils/testUtils';
import { PasswordResetConfirm } from '../passwordResetConfirm.component';
import { ROUTES } from '../../../../app.constants';
import { confirmPasswordReset } from '../../../../../modules/auth/auth.actions';

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

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should hide token and user from URL', async () => {
    const { pushSpy, history } = spiedHistory(confirmResetRoute);
    render({}, { router: { history, routePath: `/:lang${ROUTES.passwordReset.confirm}` } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/en/auth/reset-password/confirm');
    });
  });

  it('should call changePassword action with token and user when submitted', async () => {
    const newPassword = 'asdf1234';
    mockDispatch.mockResolvedValue({ isError: false });

    const { history } = spiedHistory(confirmResetRoute);
    render({}, { router: { history, routePath: `/:lang${ROUTES.passwordReset.confirm}` } });
    userEvent.type(screen.getByLabelText(/^new password$/gi), newPassword);
    userEvent.type(screen.getByLabelText(/^repeat new password$/gi), newPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /confirm the change/gi })));
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

  it('should redirect to login if there is not token or user in URL', async () => {
    const { pushSpy, history } = spiedHistory(confirmResetRouteNoToken);
    render({}, { router: { history, routePath: `/:lang${generatePath(ROUTES.passwordReset.confirm, {})}` } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/en/auth/login');
    });
  });
});
