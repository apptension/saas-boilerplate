import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { Role } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { LoginForm } from '../loginForm.component';
import { authSinginMutation } from '../loginForm.graphql';

jest.mock('@sb/webapp-core/services/analytics');

const mockSearch = '?redirect=%2Fen%2Fprofile';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: mockSearch }),
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

  const getEmailInput = async () => await screen.findByLabelText(/email/i);
  const getPasswordInput = async () => await screen.findByLabelText(/password/i);
  const clickLoginButton = async () => await userEvent.click(await screen.findByRole('button', { name: /log in/i }));
  const user = currentUserFactory({
    firstName: 'Jack',
    lastName: 'White',
    email: 'jack.white@mail.com',

    roles: [Role.USER],
  });

  it('should redirect with searchParams if otp available', async () => {
    const refreshQueryMock = fillCommonQueryWithUser(user);
    const requestMock = composeMockedQueryResult(authSinginMutation, {
      variables: mockCredentials,
      data: {
        tokenAuth: {
          access: 'access-token',
          refresh: 'refresh-token',
          otpAuthToken: 'otpAuthToken',
        },
      },
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: [requestMock, refreshQueryMock],
    });
    await waitForApolloMocks();

    await userEvent.type(await getEmailInput(), mockCredentials.input.email);
    await userEvent.type(await getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();

    expect(trackEvent).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/en/auth/validate-otp', search: mockSearch });
  });

  it('should call login action when submitted', async () => {
    const refreshQueryMock = fillCommonQueryWithUser(user);
    const requestMock = composeMockedQueryResult(authSinginMutation, {
      variables: mockCredentials,
      data: {
        tokenAuth: {
          access: 'access-token',
          refresh: 'refresh-token',
          otpAuthToken: null,
        },
      },
    });
    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, refreshQueryMock),
    });

    await userEvent.type(await getEmailInput(), mockCredentials.input.email);
    await userEvent.type(await getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();
    await waitForApolloMocks();

    expect(trackEvent).toHaveBeenCalledWith('auth', 'log-in');
  });

  it('should show error if required value is missing', async () => {
    render(<Component />);

    await userEvent.type(await getEmailInput(), 'user@mail.com');

    await clickLoginButton();

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
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

    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock) });

    await userEvent.type(await getEmailInput(), mockCredentials.input.email);
    await userEvent.type(await getPasswordInput(), mockCredentials.input.password);

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

    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock) });

    await userEvent.type(await getEmailInput(), mockCredentials.input.email);
    await userEvent.type(await getPasswordInput(), mockCredentials.input.password);

    await clickLoginButton();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await mockNavigate).not.toHaveBeenCalled();
  });
});
