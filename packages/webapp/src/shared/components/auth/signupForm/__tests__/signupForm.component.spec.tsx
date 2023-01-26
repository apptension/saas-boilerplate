import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { screen, waitFor } from '@testing-library/react';

import { render } from '../../../../../tests/utils/rendering';
import { SignupForm } from '../signupForm.component';
import { RoutesConfig } from '../../../../../app/config/routes';

import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { authSingupMutation } from '../signUpForm.graphql';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

const Component = () => <SignupForm />;
const mockCredentials = {
  input: {
    email: 'user@mail.com',
    password: 'abcxyz123456',
  },
};
describe('SignupForm: Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  const getEmailInput = () => screen.getByLabelText(/email/i);
  const getPasswordInput = () => screen.getByLabelText(/password/i);
  const getAcceptField = () => screen.getByLabelText(/accept/i);

  const clickSignupButton = () => userEvent.click(screen.getByRole('button', { name: /sign up/i }));

  it('should call signup mutation when submitted', async () => {
    const requestMock = composeMockedQueryResult(authSingupMutation, {
      variables: mockCredentials,
      data: {},
    });

    render(<Component />, { apolloMocks: [requestMock] });
    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);
    await userEvent.click(getAcceptField());

    await clickSignupButton();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/en/${RoutesConfig.home}`));
  });

  it('should show error if password value is missing', async () => {
    const variables = {
      input: {
        email: 'user@mail.com',
      },
    };

    const requestMock = composeMockedQueryResult(authSingupMutation, {
      variables,
      data: {},
    });

    render(<Component />, { apolloMocks: [requestMock] });
    await userEvent.type(getEmailInput(), variables.input.email);
    await userEvent.click(getAcceptField());

    await clickSignupButton();

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error if terms are not accepted', async () => {
    const requestMock = composeMockedQueryResult(authSingupMutation, {
      variables: mockCredentials,
      data: {},
    });

    render(<Component />, { apolloMocks: [requestMock] });

    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);

    await clickSignupButton();

    expect(await screen.findByText('You need to accept terms and conditions')).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });

  it('should show field error if password is too common', async () => {
    const errorMessage = 'The password is too common.';

    const requestMock = {
      request: {
        query: authSingupMutation,
        variables: mockCredentials,
      },
      result: {
        data: {},
        errors: [
          new GraphQLError('GraphQlValidationError', {
            extensions: { password: [{ message: errorMessage, code: 'password_too_common' }] },
          }),
        ],
      },
    };

    render(<Component />, { apolloMocks: [requestMock] });
    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);
    await userEvent.click(getAcceptField());

    await clickSignupButton();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });

  it('should show field error if email is already taken', async () => {
    const errorMessage = 'The email address is already taken';

    const requestMock = {
      request: {
        query: authSingupMutation,
        variables: mockCredentials,
      },
      result: {
        data: {},
        errors: [
          new GraphQLError('GraphQlValidationError', {
            extensions: { email: [{ message: errorMessage, code: 'unique' }] },
          }),
        ],
      },
    };

    render(<Component />, { apolloMocks: [requestMock] });
    await userEvent.type(getEmailInput(), mockCredentials.input.email);
    await userEvent.type(getPasswordInput(), mockCredentials.input.password);
    await userEvent.click(getAcceptField());

    await clickSignupButton();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });
});
