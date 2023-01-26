import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../../../tests/utils/rendering';
import { LoginForm } from '../loginForm.component';

import { RoutesConfig } from '../../../../../app/config/routes';
import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { authSinginMutation } from '../loginForm.graphql';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});
const Component = () => <LoginForm />;
describe('LoginForm: Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  const mockCredentials = {
    input: {
      email: 'user@mail.com',
      password: 'abcxyz123456',
    },
  };

  const getEmailInput = () => screen.getByLabelText(/email/i);
  const getPasswordInput = () => screen.getByLabelText(/password/i);
  const clickLoginButton = () => userEvent.click(screen.getByRole('button', { name: /log in/i }));

  it('should call login action when submitted', async () => {
    const requestMock = composeMockedQueryResult(authSinginMutation, {
      variables: mockCredentials,
      data: {},
    });
    render(<Component />, { apolloMocks: [requestMock] });

    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/en/${RoutesConfig.home}`));
  });

  it('should show error if required value is missing', async () => {
    const variables = {
      input: {
        email: 'user@mail.com',
      },
    };
    const requestMock = composeMockedQueryResult(authSinginMutation, {
      variables,
      data: {},
    });
    render(<Component />, { apolloMocks: [requestMock] });

    await userEvent.type(getEmailInput(), 'user@mail.com');

    await clickLoginButton();

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });

  it('should show generic form error if action throws error', async () => {
    const errorMessage = 'Incorrect authentication credentials.';

    const requestMock = {
      request: {
        query: authSinginMutation,
        variables: mockCredentials,
      },
      result: {
        data: {},
        errors: [
          new GraphQLError('GraphQlValidationError', {
            extensions: { nonFieldErrors: [{ message: errorMessage, code: 'Incorrect authentication credentials.' }] },
          }),
        ],
      },
    };

    render(<Component />, { apolloMocks: [requestMock] });

    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });

  it('should show common error if action throws error', async () => {
    const errorMessage = 'Server error';
    const requestMock = {
      request: {
        query: authSinginMutation,
        variables: mockCredentials,
      },
      data: {},
      result: { errors: [new GraphQLError(errorMessage)] },
    };

    render(<Component />, { apolloMocks: [requestMock] });

    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });
});
