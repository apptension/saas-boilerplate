import userEvent from '@testing-library/user-event';
import { screen, act, waitFor } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';
import { render } from '../../../../../tests/utils/rendering';
import { PasswordResetRequestForm } from '../passwordResetRequestForm.component';
import { getRelayEnv } from '../../../../../tests/utils/relay';

describe('PasswordResetRequestForm: Component', () => {
  const Component = () => <PasswordResetRequestForm />;

  const email = 'user@mail.com';

  const fillForm = async (emailValue = email) => {
    await userEvent.type(screen.getByLabelText(/email/i), emailValue);
  };

  const sendForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /send the link/i }));
  };

  it('should call requestPasswordReset action when submitted', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

    expect(relayEnvironment).toHaveLatestOperation('authRequestPasswordResetMutation');
    expect(relayEnvironment).toLatestOperationInputEqual({ email });
  });

  it('should show resend button if action completes successfully', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });

    expect(relayEnvironment).toHaveLatestOperation('authRequestPasswordResetMutation');

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });

    await waitFor(() => {
      expect(screen.getByText(/send the link again/i)).toBeInTheDocument();
    });
  });

  it('should show error if required value is missing', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await sendForm();
    });

    expect(relayEnvironment).not.toHaveLatestOperation('authRequestPasswordResetMutation');
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, { relayEnvironment });

    await act(async () => {
      await fillForm();
      await sendForm();
    });
    const errorMessage = 'Email is invalid';

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, {
        ...MockPayloadGenerator.generate(operation),
        errors: [
          {
            message: 'GraphQlValidationError',
            extensions: {
              email: [
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
    const errorMessage = 'Something went wrong';

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
