import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockPayloadGenerator } from 'relay-test-utils';
import { render } from '../../../../../tests/utils/rendering';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from '../passwordResetConfirmForm.component';
import { snackbarActions } from '../../../../../modules/snackbar';
import { getRelayEnv } from '../../../../../tests/utils/relay';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('PasswordResetConfirmForm: Component', () => {
  const defaultProps: PasswordResetConfirmFormProps = {
    user: 'user-id',
    token: 'token-value',
  };

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const formData = {
    newPassword: 'new-password',
    confirmPassword: 'new-password',
  };

  const fillForm = async (data = {}) => {
    const d = { ...formData, ...data };
    await userEvent.type(screen.getByLabelText(/^new password$/i), d.newPassword);
    if (d.confirmPassword) {
      await userEvent.type(screen.getByLabelText(/^repeat new password$/i), d.confirmPassword);
    }
  };

  const sendForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /^confirm the change$/i }));
  };

  const Component = (props: Partial<PasswordResetConfirmFormProps>) => (
    <PasswordResetConfirmForm {...defaultProps} {...props} />
  );
  it('should call changePassword action when submitted', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

    expect(relayEnvironment).toHaveLatestOperation('authRequestPasswordResetConfirmMutation');
    expect(relayEnvironment).toLatestOperationInputEqual({
      newPassword: formData.newPassword,
      token: defaultProps.token,
      user: defaultProps.user,
    });
  });

  it('should show success message if action completes successfully', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: '🎉 Password reset successfully!',
          id: 1,
        })
      );
    });
  });

  it('should show error if required value is missing', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm({ confirmPassword: null });
      await sendForm();
    });

    expect(relayEnvironment).not.toHaveLatestOperation('authRequestPasswordResetConfirmMutation');
    await waitFor(() => {
      expect(screen.getByText('Repeat new password is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

    const errorMessage = 'Provided password is invalid';

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

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

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
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
