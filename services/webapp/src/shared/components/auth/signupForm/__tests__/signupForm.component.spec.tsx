import userEvent from '@testing-library/user-event';
import { screen, act } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';

import { render } from '../../../../../tests/utils/rendering';
import { SignupForm } from '../signupForm.component';
import { RoutesConfig } from '../../../../../app/config/routes';
import { getRelayEnv } from '../../../../../tests/utils/relay';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

describe('SignupForm: Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  const getEmailInput = () => screen.getByLabelText(/email/i);
  const getPasswordInput = () => screen.getByLabelText(/password/i);
  const getAcceptField = () => screen.getByLabelText(/accept/i);
  const getSignupButton = () => screen.getByRole('button', { name: /sign up/i });
  const clickSignupButton = async () => await userEvent.click(getSignupButton());

  it('should call signup mutation when submitted', async () => {
    const mockCreds = {
      email: 'user@mail.com',
      password: 'abcxyz123456',
    };

    const relayEnvironment = getRelayEnv();

    render(<SignupForm />, { relayEnvironment });
    await userEvent.type(getEmailInput(), mockCreds.email);
    await userEvent.type(getPasswordInput(), mockCreds.password);
    await userEvent.click(getAcceptField());
    await act(async () => {
      await clickSignupButton();
    });
    expect(relayEnvironment).toHaveLatestOperation('authSignupMutation');
    expect(relayEnvironment).toLatestOperationInputEqual(mockCreds);

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/en/${RoutesConfig.home}`);
  });

  it('should show error if password value is missing', async () => {
    const relayEnvironment = getRelayEnv();
    render(<SignupForm />, { relayEnvironment });
    await userEvent.type(getEmailInput(), 'user@mail.com');
    await userEvent.click(getAcceptField());
    await act(async () => {
      await clickSignupButton();
    });
    expect(relayEnvironment).not.toHaveLatestOperation('authSignupMutation');
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error if terms are not accepted', async () => {
    const relayEnvironment = getRelayEnv();
    render(<SignupForm />, { relayEnvironment });
    await userEvent.type(getEmailInput(), 'user@mail.com');
    await userEvent.type(getPasswordInput(), 'abcxyz123456');
    await act(async () => {
      await clickSignupButton();
    });
    expect(relayEnvironment).not.toHaveLatestOperation('authSignupMutation');
    expect(screen.getByText('You need to accept terms and conditions')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show field error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();
    render(<SignupForm />, { relayEnvironment });
    await userEvent.type(getEmailInput(), 'user@mail.com');
    await userEvent.type(getPasswordInput(), 'abcxyz123456');
    await userEvent.click(getAcceptField());
    await act(async () => {
      await clickSignupButton();
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

    expect(relayEnvironment).not.toHaveLatestOperation('authSignupMutation');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show generic form error if action throws error', async () => {
    const relayEnvironment = getRelayEnv();
    render(<SignupForm />, { relayEnvironment });

    await userEvent.type(getEmailInput(), 'user@mail.com');
    await userEvent.type(getPasswordInput(), 'abcxyz123456');
    await userEvent.click(getAcceptField());
    await act(async () => {
      await clickSignupButton();
    });

    const errorMessage = 'Invalid credentials';
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

    expect(relayEnvironment).not.toHaveLatestOperation('authSignupMutation');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
