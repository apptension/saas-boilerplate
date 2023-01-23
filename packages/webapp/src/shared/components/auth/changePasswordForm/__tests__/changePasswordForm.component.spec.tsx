import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';
import { render } from '../../../../../tests/utils/rendering';
import { snackbarActions } from '../../../../../modules/snackbar';
import { ChangePasswordForm } from '../changePasswordForm.component';
import { getRelayEnv } from '../../../../../tests/utils/relay';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('ChangePasswordForm: Component', () => {
  const Component = () => <ChangePasswordForm />;

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const formData = {
    oldPassword: 'old-pass',
    newPassword: 'new-pass',
    confirmNewPassword: 'new-pass',
  };

  const fillForm = async (override = {}) => {
    const data = { ...formData, ...override };
    await userEvent.type(screen.getByLabelText(/old password/i), data.oldPassword);
    data.newPassword && (await userEvent.type(screen.getByLabelText(/^new password/i), data.newPassword));
    await userEvent.type(screen.getByLabelText(/confirm new password/i), data.confirmNewPassword);
  };

  const submitForm = () => userEvent.click(screen.getByRole('button', { name: /change password/i }));

  it('should call changePassword action when submitted', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });
    await act(async () => {
      await fillForm();
      await submitForm();
    });
    expect(relayEnvironment).toHaveLatestOperation('authChangePasswordMutation');
    expect(relayEnvironment).toLatestOperationInputEqual({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ isError: false });
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await act(async () => {
        await fillForm();
        await submitForm();
      });
      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Password successfully changed.',
          id: 1,
        })
      );
    });

    it('should clear form', async () => {
      mockDispatch.mockResolvedValue({ isError: false });

      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await act(async () => {
        await fillForm();
        await submitForm();
      });
      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
      expect(screen.queryByDisplayValue(formData.oldPassword)).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue(formData.newPassword)).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue(formData.confirmNewPassword)).not.toBeInTheDocument();
    });
  });

  it('should show error if required value is missing', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });
    await act(async () => {
      await fillForm({ newPassword: null });
      await submitForm();
    });
    expect(relayEnvironment).not.toHaveLatestOperation('authChangePasswordMutation');
    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('New password is required')).toBeInTheDocument();
  });

  it('should show error if new passwords dont match', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });
    await act(async () => {
      await fillForm({ confirmNewPassword: 'misspelled-pass' });
      await submitForm();
    });
    expect(relayEnvironment).not.toHaveLatestOperation('authChangePasswordMutation');
    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('Passwords must match')).toBeInTheDocument();
  });

  it('should show field error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });
    await act(async () => {
      await fillForm();
      await submitForm();
    });

    const errorMessage = 'Provided value is invalid';
    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, {
        ...MockPayloadGenerator.generate(operation),
        errors: [
          {
            message: 'GraphQlValidationError',
            extensions: {
              newPassword: [
                {
                  message: errorMessage,
                  code: 'invalid',
                },
              ],
            },
          },
        ],
      } as any);
    });

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show generic form error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });
    await act(async () => {
      await fillForm();
      await submitForm();
    });

    expect(relayEnvironment).toHaveLatestOperation('authChangePasswordMutation');
    const errorMessage = 'Invalid data';

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
                  code: 'invalid',
                },
              ],
            },
          },
        ],
      } as any);
    });

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
