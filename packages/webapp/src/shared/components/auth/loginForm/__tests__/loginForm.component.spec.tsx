import userEvent from '@testing-library/user-event';
import { screen, act } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { render } from '../../../../../tests/utils/rendering';
import { LoginForm } from '../loginForm.component';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';

describe('LoginForm: Component', () => {
  const renderWithRelayEnvironment = () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    return {
      ...render(<LoginForm />, { relayEnvironment }),
      relayEnvironment,
    };
  };

  const mockCreds = {
    email: 'user@mail.com',
    password: 'abcxyz',
  };

  const getEmailInput = () => screen.getByLabelText(/email/i);
  const getPasswordInput = () => screen.getByLabelText(/password/i);
  const clickLoginButton = async () => await userEvent.click(screen.getByRole('button', { name: /log in/i }));

  it('should call login action when submitted', async () => {
    const { relayEnvironment } = renderWithRelayEnvironment();

    await userEvent.type(getEmailInput(), mockCreds.email);
    await userEvent.type(getPasswordInput(), mockCreds.password);
    await act(async () => {
      await clickLoginButton();
    });
    expect(relayEnvironment).toHaveLatestOperation('loginFormMutation');
    expect(relayEnvironment).toLatestOperationInputEqual(mockCreds);
  });

  it('should show error if required value is missing', async () => {
    const { relayEnvironment } = renderWithRelayEnvironment();
    await userEvent.type(getEmailInput(), 'user@mail.com');
    await act(async () => {
      await clickLoginButton();
    });
    expect(relayEnvironment).not.toHaveOperation('loginFormMutation');
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should show field error if action throws error', async () => {
    const { relayEnvironment } = renderWithRelayEnvironment();

    const errorMessage = 'Provided password is invalid';

    await userEvent.type(getEmailInput(), mockCreds.email);
    await userEvent.type(getPasswordInput(), mockCreds.password);
    await act(async () => {
      await clickLoginButton();
    });

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, {
        ...MockPayloadGenerator.generate(operation),
        errors: [
          {
            message: 'GraphQlValidationError',
            extensions: {
              password: [
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

    expect(relayEnvironment).not.toHaveOperation('loginFormMutation');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show generic form error if action throws error', async () => {
    const { relayEnvironment } = renderWithRelayEnvironment();

    const errorMessage = 'Invalid credentials';

    await userEvent.type(getEmailInput(), mockCreds.email);
    await userEvent.type(getPasswordInput(), mockCreds.password);
    await act(async () => {
      await clickLoginButton();
    });

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

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
